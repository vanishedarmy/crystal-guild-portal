"""Server-authoritative clocks and backward compatibility for casual live duels."""
import json
import unittest
import test_queens_blood_pvp as fixtures
from crystal_guild.queens_blood import RuleError
from crystal_guild.queens_blood_store import MatchConflict
from crystal_guild.queens_blood_pvp import CorrespondenceStore, TURN_SECONDS, OPENING_SECONDS

class LiveDuelTests(unittest.TestCase):
    setUp = fixtures.PvPTests.setUp
    tearDown = fixtures.PvPTests.tearDown
    cmd = fixtures.PvPTests.cmd
    item = fixtures.PvPTests.item

    def live(self, opening=True):
        self.cmd('0', {'kind':'invite', 'username':'bob', 'mode':'live'})
        item=self.item('1'); self.cmd('1', {'kind':'accept'}, item)
        if opening:
            for p in ('0','1'): self.cmd(p, {'kind':'mulligan','indices':[]}, self.item(p,item['id']))
        return item['id']

    def actor(self, id):
        return '0' if self.item('0',id)['match']['your_turn'] else '1'

    def test_live_phase_clocks_and_separate_records(self):
        self.cmd('0', {'kind':'invite','username':'bob','mode':'live'})
        invite=self.item('1'); self.assertEqual(invite['deadline'],self.now+600)
        self.assertEqual(invite['mode'],'live'); self.assertEqual(invite['turn_seconds'],90)
        self.cmd('1',{'kind':'accept'},invite)
        self.assertEqual(self.item('0')['deadline'],self.now+180)
        for p in ('0','1'): self.cmd(p,{'kind':'mulligan','indices':[]},self.item(p))
        self.assertEqual(self.item('0')['deadline'],self.now+90)
        self.assertEqual(self.s.get('0')['server_now'],self.now)
        self.assertEqual(self.s.get('0')['stats_by_mode']['live'],{'wins':0,'losses':0,'draws':0})

    def test_opening_confirmation_cannot_extend_shared_deadline(self):
        id=self.live(False); end=self.item('0',id)['deadline']; self.now+=70
        self.cmd('0',{'kind':'mulligan','indices':[]},self.item('0',id))
        self.assertEqual(self.item('0',id)['deadline'],end)
        self.now+=50; self.cmd('1',{'kind':'mulligan','indices':[]},self.item('1',id))
        self.assertEqual(self.item('0',id)['deadline'],self.now+90)

    def test_invite_and_opening_expiry_are_unrated(self):
        self.cmd('0',{'kind':'invite','username':'bob','mode':'live'}); self.now+=600
        self.assertEqual(self.item('0')['phase'],'expired')
        id=self.live(False); self.now+=180
        self.assertEqual(self.item('0',id)['reason'],'opening_expired')
        self.assertEqual(sum(self.s.get('0')['stats'].values()),0)

    def test_restart_and_refresh_do_not_pause_clock(self):
        id=self.live(); end=self.item('0',id)['deadline']; self.now+=35
        self.s=CorrespondenceStore(self.path,clock=lambda:self.now)
        for _ in range(3): self.assertEqual(self.item('0',id)['deadline'],end)

    def test_retried_move_never_replays_or_resets_clock(self):
        id=self.live(); p=self.actor(id); before=self.item(p,id)
        move={k:before['match']['legal'][0][k] for k in ('kind','hand','row','col')}
        self.cmd(p,move,before,key='live:repeat:001'); after=self.item(p,id); self.now+=70
        self.cmd(p,move,before,key='live:repeat:001')
        self.assertEqual(self.item(p,id),after)

    def test_exact_deadline_rejects_move_and_records_one_forfeit(self):
        id=self.live(); p=self.actor(id); old=self.item(p,id); self.now=old['deadline']
        with self.assertRaises(MatchConflict): self.cmd(p,{'kind':'pass'},old)
        result=self.item(p,id)
        self.assertEqual(result['match']['board'],old['match']['board'])
        self.assertEqual(result['match']['reason'],'timeout')
        self.assertEqual(result['match']['winner'],1)
        for _ in range(3): self.assertEqual(self.s.get(p)['stats_by_mode']['live']['losses'],1)
        self.assertEqual(sum(self.s.get(p)['stats_by_mode']['correspondence'].values()),0)

    def test_last_second_move_gives_opponent_full_clock(self):
        id=self.live(); p=self.actor(id); old=self.item(p,id); self.now=old['deadline']-1
        move={k:old['match']['legal'][0][k] for k in ('kind','hand','row','col')}
        self.cmd(p,move,old)
        self.assertEqual(self.item(p,id)['deadline'],self.now+90)
        self.assertNotEqual(self.actor(id),p)

    def test_legacy_pending_invite_keeps_correspondence_clocks(self):
        self.cmd('0',{'kind':'invite','username':'bob'}); id=self.item('0')['id']
        with self.s._connect() as c:
            state=json.loads(c.execute('SELECT state_json FROM qb_duels WHERE id=?',(id,)).fetchone()[0])
            state.pop('mode'); c.execute('UPDATE qb_duels SET state_json=? WHERE id=?',(json.dumps(state),id))
        self.cmd('1',{'kind':'accept'},self.item('1',id))
        self.assertEqual(self.item('0',id)['deadline'],self.now+OPENING_SECONDS)
        for p in ('0','1'): self.cmd(p,{'kind':'mulligan','indices':[]},self.item(p,id))
        self.assertEqual(self.item('0',id)['deadline'],self.now+TURN_SECONDS)
        self.assertEqual(self.item('0',id)['mode'],'correspondence')

    def test_untrusted_mode_and_clock_fields_rejected(self):
        for mode in (None,[],{},1,'ranked','LIVE'):
            with self.assertRaises(RuleError): self.cmd('0',{'kind':'invite','username':'bob','mode':mode})
        with self.assertRaises(RuleError): self.cmd('0',{'kind':'invite','username':'bob','mode':'live','turn_seconds':999})
        self.assertEqual(self.s.get('0')['matches'],[])

    def test_live_private_hands_mirrored_board_and_no_rewards(self):
        id=self.live()
        for p in ('0','1'):
            m=self.item(p,id)['match']; self.assertEqual(len(m['hand']),5)
            for k in ('hands','decks','mulligan_seed','players','card_snapshot'): self.assertNotIn(k,m)
            self.assertTrue(all(row[0]['owner']==0 for row in m['board']))
        for _ in range(2):
            p=self.actor(id); self.cmd(p,{'kind':'pass'},self.item(p,id))
        self.assertEqual(self.s.get('0')['stats_by_mode']['live']['draws'],1)
        self.assertEqual(sum(self.s.get('0')['stats_by_mode']['correspondence'].values()),0)
        with self.s._connect() as c: self.assertEqual(c.execute('SELECT count(*) FROM qb_settlements').fetchone()[0],0)
