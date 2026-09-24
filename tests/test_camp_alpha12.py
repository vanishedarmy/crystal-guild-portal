"""New Camp actions are strictly shaped at the hosted relay boundary."""
import tempfile
import unittest
from pathlib import Path
from crystal_guild.hosted_portal import HostedPortalStore, ACTION_PROTOCOL_VERSION

class CampPortalContractTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.store = HostedPortalStore(Path(self.tmp.name) / 'hosted.db')
        self.store.upsert_player({
            'schema_version': 1, 'username': 'van', 'player_twitch_id': '123',
            'snapshot': {
                'overview': {'identity': {'username': 'van', 'display_name': 'Van',
                              'level': 1, 'title': 'Recruit', 'updated_at': '2026-09-23 00:00:00'},
                             'job': {'name': 'Warrior'}, 'status': {'state': 'ready', 'label': 'Ready'}},
                'jobs': {'jobs': []}, 'inventory': {'items': []}, 'hunts': {'summary': {}, 'hunts': []},
                'bestiary': {'summary': {'discovered': 0, 'total': 0}, 'monsters': []},
                'relics': {'relics': []}, 'achievements': {'summary': {'unlocked': 0, 'total': 0}, 'achievements': []},
                'records': {'career': {}, 'bosses': []},
            },
        })

    def tearDown(self):
        self.tmp.cleanup()

    def test_supported_actions_and_protocol(self):
        self.assertEqual(ACTION_PROTOCOL_VERSION, 38)
        self.assertEqual(self.store.create_action('123', 'CAMP_EAT_MEAL', {}, 'camp-meal-001')['type'], 'CAMP_EAT_MEAL')
        self.assertEqual(self.store.create_action('123', 'CAMP_SET_PREPARATION', {'preparation': 'scout'}, 'camp-prep-001')['type'], 'CAMP_SET_PREPARATION')
        for id in ('sharpen', 'supplies'):
            self.assertEqual(self.store.create_action('123', 'CAMP_SET_PREPARATION', {'preparation': id}, f'camp-prep-{id}-002')['type'], 'CAMP_SET_PREPARATION')

    def test_rejects_unexpected_meal_fields_and_preparation_injection(self):
        for payload in ({'quantity': 100}, {'player_id': '999'}, {'item_id': 'free_food'}):
            with self.assertRaises(ValueError):
                self.store.create_action('123', 'CAMP_EAT_MEAL', payload, f'camp-bad-meal-{len(payload)}-{next(iter(payload))}')
        for payload in ({}, {'preparation': 'scout', 'quantity': 9}, {'preparation': 'junk'}, {'preparation': None}):
            with self.assertRaises(ValueError):
                self.store.create_action('123', 'CAMP_SET_PREPARATION', payload, f'camp-bad-prep-{str(payload)}'.replace(' ', '')[:100])
