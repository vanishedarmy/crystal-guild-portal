import tempfile, unittest
from pathlib import Path
from crystal_guild.hosted_portal import HostedPortalStore, ACTION_PROTOCOL_VERSION, HOSTED_PORTAL_VERSION, ALLOWED_PORTAL_ACTIONS

class MercBatch3HostedTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(); self.store=HostedPortalStore(Path(self.tmp.name)/'portal.db')
        self.store.upsert_player({'schema_version':1,'username':'van','player_twitch_id':'100','snapshot':{'overview':{'identity':{'username':'van','display_name':'Van','level':30,'title':'Hunter','updated_at':'2026-09-16 00:00:00'},'job':{'name':'Warrior'},'status':{'state':'ready','label':'Ready'}},'jobs':{'jobs':[]},'inventory':{'items':[]},'hunts':{'summary':{},'hunts':[]},'bestiary':{'summary':{'discovered':0,'total':0},'monsters':[]},'relics':{'relics':[]},'achievements':{'summary':{'unlocked':0,'total':0},'achievements':[]},'records':{'career':{},'bosses':[]}}})
    def tearDown(self): self.tmp.cleanup()
    def test_contract_and_capabilities(self):
        self.assertEqual(ACTION_PROTOCOL_VERSION,36); self.assertEqual(HOSTED_PORTAL_VERSION,'1.9.0-economy-balance-alpha2')
        self.assertTrue({'MERC_STATE','MERC_HIRE','MERC_CANCEL'} <= ALLOWED_PORTAL_ACTIONS)
    def test_merc_payloads_are_strict(self):
        state=self.store.create_action('100','MERC_STATE',{},'merc-state-1234'); self.assertEqual(state['type'],'MERC_STATE')
        hire=self.store.create_action('100','MERC_HIRE',{'hero_id':'aerith','mission_type':'hunt'},'merc-hire-1234'); self.assertEqual(hire['type'],'MERC_HIRE')
        cancel=self.store.create_action('100','MERC_CANCEL',{'mission_type':'hunt'},'merc-cancel-1234'); self.assertEqual(cancel['type'],'MERC_CANCEL')
        with self.assertRaises(ValueError): self.store.create_action('100','MERC_HIRE',{'hero_id':'../../bad','mission_type':'hunt'},'merc-hire-bad1')
        with self.assertRaises(ValueError): self.store.create_action('100','MERC_HIRE',{'hero_id':'aerith','mission_type':'dungeon'},'merc-hire-bad2')
        with self.assertRaises(ValueError): self.store.create_action('100','MERC_CANCEL',{'force':True},'merc-cancel-bad')
        with self.assertRaises(ValueError): self.store.create_action('100','MERC_CANCEL',{'mission_type':'dungeon'},'merc-cancel-bad2')
if __name__=='__main__': unittest.main()
