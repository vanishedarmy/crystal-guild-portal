"""Behavioral cases for the versioned advanced rules and public previews."""
import copy
import json
import unittest
from crystal_guild.queens_blood import (CARDS, DECK, LEGACY_RULES_VERSION, RULES_VERSION, RuleError,
    _resolve, ai_move, apply_action, legal_moves, new_match, powers, public_match, scores)
from crystal_guild.queens_blood_catalog import OPPONENTS
from crystal_guild.queens_blood_pvp import perspective


def position(card, side=0, row=1, col=None):
    s=new_match(seed=42); s.update(phase='play',turn=side,hands=[[],[]],decks=[[],[]])
    s['hands'][side]=[card]
    col=(0 if side==0 else 4) if col is None else col
    s['board'][row][col].update(owner=side,rank=3)
    return s, {'kind':'play','hand':0,'row':row,'col':col}


def put(s,id,r,c,side=1,bonus=0,rank=3):
    s['board'][r][c].update(owner=side,card=id,bonus=bonus,rank=rank)


class AdvancedRulesTests(unittest.TestCase):
    def test_enfeeble_destroy_and_capture(self):
        s,a=position('QB007'); put(s,'QB003',1,1)
        before=copy.deepcopy(s); t=apply_action(s,0,a)
        self.assertEqual(s,before)
        self.assertEqual((t['board'][1][1]['card'],t['board'][1][1]['owner'],t['board'][1][1]['rank']),(None,0,1))
        self.assertEqual([e['kind'] for e in t['events']],['enfeebled','destroyed'])
    def test_removal_outside_claim_keeps_previous_owner(self):
        s,a=position('QB035'); put(s,'QB003',1,2)
        t=apply_action(s,0,a);tile=t['board'][1][2]
        self.assertEqual((tile['card'],tile['owner'],tile['rank']),(None,1,1))
    def test_surviving_damage_permanent(self):
        s,a=position('QB024');put(s,'QB012',1,1)
        t=apply_action(s,0,a);self.assertEqual(powers(t)[1][1],3)
        t['board'][1][0]['card']=None;self.assertEqual(powers(t)[1][1],3)
    def test_enemy_target_ignores_ally(self):
        s,a=position('QB007');put(s,'QB003',1,1,side=0)
        t=apply_action(s,0,a);self.assertEqual(powers(t)[1][1],2)
    def test_all_target_hits_ally(self):
        s,a=position('QB010');put(s,'QB009',1,1,side=0)
        t=apply_action(s,0,a);self.assertIsNone(t['board'][1][1]['card'])
    def test_negative_aura_and_later_arrival(self):
        s,a=position('QB034');t=apply_action(s,0,a)
        t['turn']=1;t['hands'][1]=['QB003'];t['board'][1][1].update(owner=1,rank=1)
        t=apply_action(t,1,{'kind':'play','hand':0,'row':1,'col':1});self.assertEqual(powers(t)[1][1],1)
        t['board'][1][0]['card']=None;self.assertEqual(powers(t)[1][1],2)
    def test_source_loss_cascades_and_bomb_triggers(self):
        s,a=position('QB024');put(s,'QB002',1,1);put(s,'QB006',0,1,bonus=-2);put(s,'QB009',0,2,side=0)
        # Bomb survives at 1 power only while Moogle is present.
        self.assertEqual(powers(s)[0][1],1)
        t=apply_action(s,0,a)
        self.assertIsNone(t['board'][1][1]['card']);self.assertIsNone(t['board'][0][1]['card']);self.assertIsNone(t['board'][0][2]['card'])
        self.assertEqual(sum(e['kind']=='destroyed' for e in t['events']),3)
    def test_simultaneous_bomb_chain_resolves_once(self):
        s,a=position('QB046',row=1,col=2);put(s,'QB006',1,1,side=1,bonus=-1);put(s,'QB006',1,3,side=1,bonus=-1)
        t=apply_action(s,0,a)
        self.assertIsNone(t['board'][1][1]['card']);self.assertIsNone(t['board'][1][3]['card'])
        self.assertIsNone(t['board'][1][2]['card']);self.assertEqual(sum(e['kind']=='destroyed' for e in t['events']),3)
    def test_replacement_requires_owned_card_without_rank_cost(self):
        s,a=position('QB031');self.assertEqual(legal_moves(s),[])
        put(s,'QB001',1,0,side=0,rank=0)
        self.assertEqual(legal_moves(s),[a]);put(s,'QB001',0,0,side=1)
        self.assertNotIn({'kind':'play','hand':0,'row':0,'col':0},legal_moves(s))
        t=apply_action(s,0,a);self.assertEqual(t['board'][1][0]['card'],'QB031')
    def test_noctis_uses_printed_not_enhanced_power(self):
        s,a=position('QB031');put(s,'QB003',1,0,side=0,bonus=7)
        t=apply_action(s,0,a);self.assertEqual(powers(t)[1][0],4)
    def test_ultimecia_inheritance_and_buffs(self):
        s,a=position('QB048');put(s,'QB012',1,0,side=0,bonus=4);put(s,'QB003',0,0,side=0)
        t=apply_action(s,0,a);self.assertEqual(powers(t)[1][0],5);self.assertEqual(powers(t)[0][0],3)
    def test_phoenix_replaces_bomb_and_fires_both_abilities(self):
        s,a=position('QB038');put(s,'QB006',1,0,side=0);put(s,'QB009',1,1);put(s,'QB003',0,0,side=0)
        t=apply_action(s,0,a);self.assertIsNone(t['board'][1][1]['card']);self.assertEqual(powers(t)[0][0],4)
        self.assertIn('replaced',[e['kind'] for e in t['events']])
    def test_sephiroth_replace_and_remove(self):
        s,a=position('QB047');put(s,'QB001',1,0,side=0);put(s,'QB011',1,1)
        t=apply_action(s,0,a);self.assertIsNone(t['board'][1][1]['card']);self.assertEqual(powers(t)[1][0],4)
    def test_preview_matches_committed_board_and_events(self):
        for id in ('QB007','QB035','QB038','QB031','QB047','QB048'):
            s,a=position(id);put(s,'QB003',1,1)
            if CARDS[id]['rank']=='Replace':put(s,'QB006',1,0,side=0)
            before=copy.deepcopy(s);preview=next(m for m in public_match(s)['legal'] if all(m[k]==a[k] for k in a))
            t=apply_action(s,0,a);actual=public_match(t)
            self.assertEqual(preview['board'],actual['board']);self.assertEqual(preview['scores'],actual['scores']);self.assertEqual(preview['events'],actual['events']);self.assertEqual(s,before)
    def test_pvp_preview_mirror_and_privacy(self):
        s,a=position('QB047',side=1);put(s,'QB001',1,4,side=1);put(s,'QB011',1,3,side=0)
        s.update(players=[{'username':'alice'},{'username':'bob'}],deck_names=['A','B'],opening=[True,True],deadline=9999)
        p=perspective(s,1);preview=next(m for m in p['legal'] if m['row']==1 and m['col']==0)
        t=apply_action(s,1,a);projected=perspective(t,1)
        self.assertEqual(preview['board'],projected['board']);self.assertEqual(preview['events'],projected['events'])
        for k in ('hands','decks','mulligan_seed','card_snapshot'):self.assertNotIn(k,projected)
    def test_legacy_saved_match_preserves_original_order(self):
        s,a=position('QB001');s['rules_version']=LEGACY_RULES_VERSION;s['catalog_revision']=2
        put(s,'QB003',1,1);t=apply_action(s,0,a)
        self.assertEqual(t['rules_version'],LEGACY_RULES_VERSION);self.assertEqual(t['board'][1][1]['owner'],1)
        t=apply_action(t,1,{'kind':'pass'});self.assertEqual(t['phase'],'play')
    def test_each_enabled_advanced_card_can_be_played(self):
        for id,card in CARDS.items():
            for side in (0,1):
                with self.subTest(card=id,side=side):
                    s,a=position(id,side=side)
                    if card['rank']=='Replace':put(s,'QB001',1,a['col'],side=side)
                    self.assertIn(a,legal_moves(s));t=apply_action(s,side,a);self.assertEqual(t['revision'],1)
    def test_many_advanced_matches_terminate_and_previews_stay_private(self):
        for opponent in list(OPPONENTS.values())[6:]:
            for seed in range(4):
                s=apply_action(new_match('practice',seed,player_deck=opponent['deck'],opponent_deck=opponent['deck']),0,{'kind':'mulligan','indices':[]})
                for _ in range(80):
                    if s['phase']=='finished':break
                    side=s['turn'];moves=legal_moves(s);a=ai_move(s) if side==1 else moves[0] if moves else {'kind':'pass'}
                    s=apply_action(s,side,a)
                    self.assertTrue(all(powers(s)[r][c]>0 for r,row in enumerate(s['board']) for c,t in enumerate(row) if t['card']))
                self.assertEqual(s['phase'],'finished')

class AdvancedPersistenceTests(unittest.TestCase):
    def test_existing_circuit_progress_unlocks_new_tier(self):
        import tempfile
        from pathlib import Path
        from crystal_guild.queens_blood_store import QueensBloodStore,initial_profile
        with tempfile.TemporaryDirectory() as root:
            store=QueensBloodStore(Path(root)/'db');profile=initial_profile()
            profile['victories']={id:1 for id in list(OPPONENTS)[:6]}
            with store._connect() as c:c.execute('INSERT INTO qb_profiles VALUES (?,?)',('1',json.dumps(profile)))
            payload=store.get('1');self.assertTrue(payload['opponents'][6]['unlocked']);self.assertFalse(payload['opponents'][7]['unlocked'])
            self.assertEqual(payload['profile']['victories'],profile['victories'])
    def test_advanced_move_atomic_replay_and_restart(self):
        import tempfile
        from pathlib import Path
        from concurrent.futures import ThreadPoolExecutor
        from crystal_guild.queens_blood_store import QueensBloodStore
        with tempfile.TemporaryDirectory() as root:
            path=Path(root)/'db';store=QueensBloodStore(path);s,a=position('QB047');put(s,'QB006',1,0,side=0);put(s,'QB003',1,1)
            with store._connect() as c:c.execute('INSERT INTO qb_matches VALUES (?,?,?)',('1',json.dumps(s),1))
            command={'match_id':s['id'],'revision':0,'action':a}
            def send(_):return QueensBloodStore(path).submit('1','advanced:once000',command)
            with ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(send,range(4)))
            self.assertTrue(all(x==results[0] for x in results));saved=QueensBloodStore(path).get('1')
            self.assertEqual(saved,results[0]);self.assertEqual(saved['match']['board'][1][0]['card'],'QB047');self.assertIsNone(saved['match']['board'][1][1]['card'])
            self.assertEqual(saved['match']['revision'],2)
    def test_actual_older_snapshot_stays_old_until_next_match(self):
        import tempfile
        from pathlib import Path
        from crystal_guild.queens_blood_store import QueensBloodStore
        with tempfile.TemporaryDirectory() as root:
            store=QueensBloodStore(Path(root)/'db');s=new_match();s['rules_version']=LEGACY_RULES_VERSION;s['catalog_revision']=2
            oldids={'QB001','QB002','QB003','QB004','QB005','QB009','QB011','QB012','QB013','QB015','QB017','QB018','QB020','QB021','QB025','QB026','QB028','QB030','QB036','QB041'}
            s['card_snapshot']={id:c for id,c in s['card_snapshot'].items() if id in oldids}
            with store._connect() as c:c.execute('INSERT INTO qb_matches VALUES (?,?,?)',('1',json.dumps(s),1))
            before=store.get('1');self.assertEqual(len(before['match_cards']),20)
            done=store.submit('1','old:resign000',{'match_id':s['id'],'revision':0,'action':{'kind':'resign'}})
            self.assertEqual(done['match']['rules_version'],LEGACY_RULES_VERSION)
            fresh=store.submit('1','new:start000',{'match_id':s['id'],'revision':1,'action':{'kind':'start','mode':'practice'}})
            self.assertEqual(fresh['match']['rules_version'],RULES_VERSION);self.assertEqual(len(fresh['match_cards']),48)
