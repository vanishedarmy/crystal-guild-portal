"""Step 5 hosted Hall projection: consume only sanitized authoritative moment slots."""
import unittest
from crystal_guild.trophy_hall import build_trophy_hall

class Step5HallProjectionTests(unittest.TestCase):
    def test_two_unearned_secret_slots_do_not_expose_rewards(self):
        sealed=[{'id': f'sealed_trophy_slot_{n:02d}', 'name':'Undiscovered Trophy',
                 'category':'mystery','art':None,'secret':True,'earned':False} for n in (1,2)]
        payload=build_trophy_hall({'overview':{'identity':{'username':'van'}},
                                    'trophies':{'unlocked':[], 'moment_slots':sealed}})
        self.assertEqual(payload['summary'],{'unlocked':0,'total':32})
        self.assertEqual(len(payload['moment_slots']),2)
        self.assertEqual({r['category'] for r in payload['moment_slots']},{'mystery'})
        self.assertNotIn('The Close Call',str(payload))

    def test_earned_slot_survives_hosted_projection_once(self):
        trophy_id='moment_trophy_world_event_close_call'
        first={'id':trophy_id,'name':'The Close Call','category':'world_events',
               'art':'/trophies/a2/moments/world-event-close-call.webp','secret':True,'earned':True}
        sealed={'id':'sealed_trophy_slot_02','name':'Undiscovered Trophy','category':'mystery',
                'art':None,'secret':True,'earned':False}
        payload=build_trophy_hall({'overview':{'identity':{'username':'van'}},
                                    'trophies':{'unlocked':[{'id':trophy_id,'unlocked_at':'2026-09-23'}],
                                                'moment_slots':[first,sealed]}})
        self.assertEqual(payload['summary'],{'unlocked':1,'total':32})
        self.assertEqual(payload['moment_slots'][0]['name'],'The Close Call')
        self.assertIsNone(payload['moment_slots'][1]['art'])
        self.assertEqual(payload['unlocked'][0]['id'],trophy_id)
