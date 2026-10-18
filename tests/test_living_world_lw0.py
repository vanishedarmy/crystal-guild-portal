"""Living World hosted Portal route and legacy snapshot compatibility."""
from __future__ import annotations

import json
import unittest

from crystal_guild.hosted_portal import HostedPortalStore, LIVING_WORLD_FALLBACK, validate_snapshot_payload
import test_hosted_portal as _hosted_fixture

snapshot_payload = _hosted_fixture.snapshot_payload


class LivingWorldHostedTests(unittest.TestCase):
    setUp = _hosted_fixture.PortalServerCase.setUp
    tearDown = _hosted_fixture.PortalServerCase.tearDown
    get = _hosted_fixture.PortalServerCase.get
    post = _hosted_fixture.PortalServerCase.post
    def test_legacy_player_snapshot_gets_safe_dormant_living_world_fallback(self):
        self.post('/api/sync/player', snapshot_payload('van'))
        status, raw, _ = self.get('/api/player/van/living_world')
        self.assertEqual(status, 200)
        snap = json.loads(raw)
        self.assertEqual(len(snap['regions']), 8)
        self.assertTrue(snap['sync_pending'])
        self.assertFalse(snap['playable'])

    def test_updated_living_world_module_roundtrips(self):
        payload = snapshot_payload('van')
        updated = json.loads(json.dumps(LIVING_WORLD_FALLBACK))
        updated['sync_pending'] = False
        payload['snapshot']['living_world'] = updated
        validate_snapshot_payload(payload)
        self.post('/api/sync/player', payload)
        status, raw, _ = self.get('/api/player/van/living_world')
        self.assertEqual(status, 200)
        snap = json.loads(raw)
        self.assertFalse(snap['sync_pending'])
        self.assertEqual(snap['milestone'], 'LW-0')

    def test_lw1_verdant_wilds_projection_roundtrips_without_private_ids(self):
        payload = snapshot_payload('van')
        updated = json.loads(json.dumps(LIVING_WORLD_FALLBACK))
        updated.update(milestone='LW-1', enabled=True, playable=True, sync_pending=False,
                       how_to_explore='Bank a completed Solo Venture in Greenwind Plains.')
        updated['regions'][0].update(unlocked=True, status='available', progress=25, discovery_count=1,
                                     total_discoveries=4,
                                     discoveries=[{'id':'oldstone_arch','name':'Oldstone Arch','discovered':True}])
        updated['summary'].update(regions_unlocked=1, discoveries=1)
        payload['snapshot']['living_world'] = updated
        validate_snapshot_payload(payload)
        self.post('/api/sync/player', payload)
        status, raw, _ = self.get('/api/player/van/living_world')
        self.assertEqual(status, 200)
        displayed = json.loads(raw)
        self.assertEqual(displayed['milestone'], 'LW-1')
        self.assertTrue(displayed['playable'])
        self.assertEqual(displayed['regions'][0]['discovery_count'], 1)
        self.assertNotIn('twitch_id',raw)

    def test_private_ids_are_rejected(self):
        payload = snapshot_payload('van')
        payload['snapshot']['living_world'] = {'player_twitch_id': '10001'}
        with self.assertRaises(ValueError):
            validate_snapshot_payload(payload)


if __name__ == '__main__':
    unittest.main()
