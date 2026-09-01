from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from crystal_guild.hosted_portal import ACTION_PROTOCOL_VERSION, FRONTEND_ASSET_REVISION, HOSTED_PORTAL_VERSION, HostedPortalStore


class RetainerHostedAlpha2Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = HostedPortalStore(Path(self.temp.name) / "mirror.db")
        self.store.upsert_player({"schema_version":1,"username":"van","player_twitch_id":"100","snapshot":{"overview":{"identity":{"username":"van","display_name":"Van","level":12,"title":"Fresh Recruit","updated_at":"2026-09-01 00:00:00"},"job":{"name":"Warrior"},"status":{"state":"ready","label":"Ready"}},"jobs":{"jobs":[]},"inventory":{"items":[]},"hunts":{"summary":{},"hunts":[]},"bestiary":{"summary":{"discovered":0,"total":0},"monsters":[]},"relics":{"relics":[]},"achievements":{"summary":{"unlocked":0,"total":0},"achievements":[]},"records":{"career":{},"bosses":[]}}})
    def tearDown(self): self.temp.cleanup()

    def test_alpha2_contract(self):
        self.assertEqual(HOSTED_PORTAL_VERSION, "1.7.0-retainer-a2")
        self.assertEqual(FRONTEND_ASSET_REVISION, "1.7.0-retainer-a2")
        self.assertEqual(ACTION_PROTOCOL_VERSION, 31)

    def test_dispatch_accepts_optional_bounded_priority(self):
        general = self.store.create_action("100", "RETAINER_DISPATCH", {"assignment":"field_gathering"}, "retainer-a2-general")
        self.assertEqual(general["type"], "RETAINER_DISPATCH")
        focused = self.store.create_action("100", "RETAINER_DISPATCH", {"assignment":"field_gathering","priority":"iron_ore"}, "retainer-a2-focused")
        self.assertEqual(focused["type"], "RETAINER_DISPATCH")
        with self.assertRaises(ValueError): self.store.create_action("100", "RETAINER_DISPATCH", {"assignment":"field_gathering","priority":"../../bad"}, "retainer-a2-bad")
        with self.assertRaises(ValueError): self.store.create_action("100", "RETAINER_DISPATCH", {"assignment":"field_gathering","priority":"iron_ore","force":True}, "retainer-a2-extra")

if __name__ == "__main__": unittest.main()
