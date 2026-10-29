"""Count-status classification, bounded once-only chains and saved-match safety."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from crystal_guild.queens_blood import (ADVANCED_RULES_VERSION, CARDS, RULES_VERSION,
    _resolve, apply_action, card_statuses, new_match, powers, public_match, scores)
from crystal_guild.queens_blood_catalog import OPPONENTS, PLAYABLE
from crystal_guild.queens_blood_pvp import perspective
from crystal_guild.queens_blood_store import QueensBloodStore, initial_profile


def board():
    s=new_match('practice',seed=23)
    s.update(phase='play',hands=[[],[]],decks=[[],[]],events=[])
    return s


def put(s,id,r,c,side=0,bonus=0,**extra):
    s['board'][r][c].update(owner=side,card=id,bonus=bonus,rank=3,**extra)


class CountTests(unittest.TestCase):
    def test_two_unenhanced_flans_do_not_bootstrap_each_other(self):
        s=board();put(s,'QB014',1,0);put(s,'QB014',1,1)
        self.assertEqual(powers(s)[1][:2],[1,1])
        for _ in range(5):self.assertEqual(powers(s)[1][:2],[1,1])
    def test_scaling_bonus_does_not_make_another_flan_qualify(self):
        s=board();put(s,'QB014',1,0);put(s,'QB014',1,1,bonus=1)
        self.assertEqual(powers(s)[1][:2],[2,2]);self.assertEqual(card_statuses(s)[1][:2],['normal','enhanced'])
        put(s,'QB003',2,4,bonus=1)
        self.assertEqual(powers(s)[1][:2],[3,3])
    def test_flan_uses_other_allies_not_self_or_enemies(self):
        s=board();put(s,'QB014',1,0,bonus=2);put(s,'QB003',0,2,bonus=1);put(s,'QB003',2,2,side=1,bonus=1)
        self.assertEqual(powers(s)[1][0],4)
    def test_net_cancellation_and_ongoing_aura(self):
        s=board();put(s,'QB014',1,0);put(s,'QB003',1,2,bonus=-1);put(s,'QB002',0,2)
        self.assertEqual(card_statuses(s)[1][2],'normal');self.assertEqual(powers(s)[1][0],1)
        s['board'][1][2]['bonus']=0;self.assertEqual(powers(s)[1][0],2)
        s['board'][0][2]['card']=None;self.assertEqual(powers(s)[1][0],1)
    def test_ahriman_and_exdeath_count_enemies_everywhere(self):
        s=board();put(s,'QB016',1,0);put(s,'QB045',1,1);put(s,'QB012',0,4,side=1,bonus=-1);put(s,'QB011',2,4,side=1,bonus=-1);put(s,'QB003',1,2,bonus=-1)
        self.assertEqual((powers(s)[1][0],powers(s)[1][1]),(4,6))
        s['board'][0][4]['card']=None;self.assertEqual((powers(s)[1][0],powers(s)[1][1]),(3,5))
    def test_intrinsic_count_can_overcome_damage_without_changing_status(self):
        s=board();put(s,'QB016',1,0,bonus=-1);put(s,'QB012',0,4,side=1,bonus=-1);put(s,'QB011',2,4,side=1,bonus=-1)
        self.assertEqual(powers(s)[1][0],3);self.assertEqual(card_statuses(s)[1][0],'enfeebled')
    def test_inherited_printed_power_is_not_external_enhancement(self):
        s=board();put(s,'QB014',1,0);put(s,'QB031',1,2,bonus=7,inherited=7)
        self.assertEqual(powers(s)[1][0],1);self.assertEqual(card_statuses(s)[1][2],'normal')
        put(s,'QB002',0,2);self.assertEqual(powers(s)[1][0],2)
    def test_removal_recomputes_count_and_can_destroy_counter(self):
        s=board();put(s,'QB016',1,0,bonus=-2);put(s,'QB003',1,4,side=1,bonus=-2)
        self.assertEqual(powers(s)[1][0],1);_resolve(s)
        self.assertIsNone(s['board'][1][4]['card']);self.assertIsNone(s['board'][1][0]['card'])
    def test_count_source_and_status_are_pure(self):
        s=board();put(s,'QB016',1,0);put(s,'QB012',0,4,side=1,bonus=-1);before=copy.deepcopy(s)
        for _ in range(3):powers(s);card_statuses(s);public_match(s)
        self.assertEqual(s,before)
    def test_placement_logs_passive_count_change(self):
        s=board();put(s,'QB014',2,0);put(s,'QB003',0,0);s['hands'][0]=['QB009']
        t=apply_action(s,0,{'kind':'play','hand':0,'row':1,'col':0})
        self.assertEqual(powers(t)[2][0],3)
        self.assertIn({'kind':'scaling','card':'QB014','row':2,'col':0,'amount':1},t['events'])


class ThresholdTests(unittest.TestCase):
    def test_onion_knight_fires_on_entry_at_threshold(self):
        s=board();s['hands'][0]=['QB019'];s['board'][1][2].update(owner=0,rank=1)
        put(s,'QB020',1,1);put(s,'QB002',0,2);put(s,'QB003',2,2)
        t=apply_action(s,0,{'kind':'play','hand':0,'row':1,'col':2})
        self.assertTrue(t['board'][1][2]['threshold_fired']);self.assertEqual(powers(t)[2][2],4)
        self.assertEqual(sum(e['kind']=='threshold' for e in t['events']),1)
    def test_below_threshold_does_not_fire(self):
        s=board();put(s,'QB019',1,0,bonus=2);_resolve(s)
        self.assertFalse(s['board'][1][0].get('threshold_fired',False))
    def test_overshooting_threshold_still_fires(self):
        s=board();put(s,'QB019',1,0,bonus=6);put(s,'QB003',0,0);_resolve(s)
        self.assertTrue(s['board'][1][0]['threshold_fired']);self.assertEqual(powers(s)[0][0],4)
    def test_power_drop_and_recovery_do_not_retrigger(self):
        s=board();put(s,'QB019',1,0,bonus=3);put(s,'QB003',0,0);_resolve(s)
        s['board'][1][0]['bonus']=0;_resolve(s);s['board'][1][0]['bonus']=3;_resolve(s)
        self.assertEqual(s['board'][0][0]['bonus'],2)
        self.assertEqual(sum(e['kind']=='threshold' for e in s['events']),1)
    def test_threshold_chain_fires_each_once(self):
        s=board();put(s,'QB019',1,2,bonus=3);put(s,'QB023',0,2,bonus=1);put(s,'QB003',1,3)
        _resolve(s);self.assertEqual([e['card'] for e in s['events'] if e['kind']=='threshold'],['QB019','QB023'])
        self.assertEqual(powers(s)[1][3],4);self.assertTrue(s['board'][0][2]['threshold_fired'])
    def test_simultaneously_ready_thresholds_all_marked_once(self):
        s=board();put(s,'QB019',1,2,bonus=3);put(s,'QB023',0,2,bonus=3);_resolve(s)
        self.assertEqual(sum(e['kind']=='threshold' for e in s['events']),2)
    def test_source_destruction_precedes_survivor_threshold_check(self):
        s=board();put(s,'QB019',1,2,bonus=2);put(s,'QB002',0,2,bonus=-1);put(s,'QB003',2,2)
        self.assertEqual(powers(s)[1][2],4);_resolve(s)
        self.assertFalse(s['board'][1][2].get('threshold_fired',False));self.assertEqual(powers(s)[2][2],2)
    def test_threshold_chain_updates_flan_count(self):
        s=board();put(s,'QB019',1,2,bonus=3);put(s,'QB003',0,2);put(s,'QB014',2,4);_resolve(s)
        self.assertEqual(powers(s)[2][4],3) # enhanced Knight and enhanced Goblin
    def test_replacing_threshold_card_clears_fired_marker(self):
        s=board();put(s,'QB019',1,0,bonus=3,threshold_fired=True);s['hands'][0]=['QB031']
        t=apply_action(s,0,{'kind':'play','hand':0,'row':1,'col':0})
        self.assertEqual(t['board'][1][0]['card'],'QB031');self.assertFalse(t['board'][1][0]['threshold_fired'])
        self.assertEqual(t['board'][1][0]['inherited'],1)
    def test_cloud_reversed_forward_diagonals(self):
        s=board();s['turn']=1;put(s,'QB023',1,4,side=1,bonus=3);put(s,'QB003',0,3,side=1);put(s,'QB003',2,3,side=1);_resolve(s)
        self.assertEqual((powers(s)[0][3],powers(s)[2][3]),(4,4))
    def test_preview_is_full_threshold_commit_and_does_not_fire_real_state(self):
        s=board();put(s,'QB023',1,2,bonus=2);put(s,'QB003',0,3);s['hands'][0]=['QB009'];s['board'][0][2].update(owner=0,rank=1)
        before=copy.deepcopy(s);a={'kind':'play','hand':0,'row':0,'col':2};preview=next(m for m in public_match(s)['legal'] if all(m[k]==a[k] for k in a))
        self.assertEqual(s,before);t=apply_action(s,0,a);p=public_match(t)
        self.assertEqual(preview['board'],p['board']);self.assertEqual(preview['events'],p['events']);self.assertEqual(preview['scores'],p['scores'])
        self.assertTrue(t['board'][1][2]['threshold_fired'])
    def test_pvp_mirror_preserves_threshold_and_status_flags(self):
        s=board();s['turn']=1;put(s,'QB023',1,2,side=1,bonus=2);put(s,'QB003',0,1,side=1);s['hands'][1]=['QB009'];s['board'][0][2].update(owner=1,rank=1)
        s.update(players=[{'username':'alice'},{'username':'bob'}],deck_names=['A','B'],opening=[True,True],deadline=9999)
        a={'kind':'play','hand':0,'row':0,'col':2};preview=next(m for m in perspective(s,1)['legal'] if all(m[k]==a[k] for k in a))
        p=perspective(apply_action(s,1,a),1);self.assertEqual(preview['board'],p['board']);self.assertEqual(preview['events'],p['events'])
        self.assertEqual(p['board'][1][2]['status'],'enhanced');self.assertTrue(p['board'][1][2]['threshold_fired'])
        for private in ('hands','decks','mulligan_seed'):self.assertNotIn(private,p)


class CompleteRosterPersistenceTests(unittest.TestCase):
    def test_old_qb4a_snapshot_and_version_remain_unchanged(self):
        with tempfile.TemporaryDirectory() as root:
            store=QueensBloodStore(Path(root)/'db');s=board();s.update(rules_version=ADVANCED_RULES_VERSION,catalog_revision=3)
            pending={'QB014','QB016','QB019','QB023','QB045'};s['card_snapshot']={id:c for id,c in s['card_snapshot'].items() if id not in pending}
            s['hands'][0]=['QB003'];put(s,'QB031',1,2,bonus=2);before=json.loads(json.dumps(public_match(s)))
            with store._connect() as c:c.execute('INSERT INTO qb_matches VALUES (?,?,?)',('1',json.dumps(s),1))
            saved=QueensBloodStore(store.database_path).get('1');self.assertEqual(saved['match'],before);self.assertEqual(len(saved['match_cards']),43)
            self.assertNotIn('status',saved['match']['board'][1][2])
            done=store.submit('1','old:finish000',{'match_id':s['id'],'revision':0,'action':{'kind':'resign'}})
            fresh=store.submit('1','new:start0000',{'match_id':s['id'],'revision':done['match']['revision'],'action':{'kind':'start','mode':'practice'}})
            self.assertEqual(len(fresh['match_cards']),48);self.assertEqual(fresh['match']['rules_version'],RULES_VERSION)
    def test_atomic_threshold_and_restart_remember_firing(self):
        with tempfile.TemporaryDirectory() as root:
            path=Path(root)/'db';store=QueensBloodStore(path);s=board();put(s,'QB023',1,2,bonus=2);put(s,'QB003',0,3);s['hands'][0]=['QB009'];s['board'][0][2].update(owner=0,rank=1)
            with store._connect() as c:c.execute('INSERT INTO qb_matches VALUES (?,?,?)',('1',json.dumps(s),1))
            payload={'match_id':s['id'],'revision':0,'action':{'kind':'play','hand':0,'row':0,'col':2}}
            def submit(_):return QueensBloodStore(path).submit('1','threshold:once000',payload)
            with ThreadPoolExecutor(max_workers=4) as pool:responses=list(pool.map(submit,range(4)))
            self.assertTrue(all(r==responses[0] for r in responses));self.assertTrue(QueensBloodStore(path).get('1')['match']['board'][1][2]['threshold_fired'])
            with store._connect() as c:raw=json.loads(c.execute('SELECT state_json FROM qb_matches').fetchone()[0])
            self.assertEqual(raw['board'][0][3]['bonus'],2);self.assertEqual(raw['revision'],2)
    def test_previous_complete_circuit_opens_final_two_opponents(self):
        with tempfile.TemporaryDirectory() as root:
            store=QueensBloodStore(Path(root)/'db');p=initial_profile();p['victories']={id:1 for id in list(OPPONENTS)[:12]}
            with store._connect() as c:c.execute('INSERT INTO qb_profiles VALUES (?,?)',('1',json.dumps(p)))
            result=store.get('1');self.assertTrue(result['opponents'][12]['unlocked']);self.assertFalse(result['opponents'][13]['unlocked'])
            self.assertEqual(len(PLAYABLE),48);self.assertEqual(set(PLAYABLE),set(result['cards'][i]['id'] for i in range(48)))
