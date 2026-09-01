from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from crystal_guild.hosted_portal import ACTION_PROTOCOL_VERSION, ALLOWED_PORTAL_ACTIONS, FRONTEND_ASSET_REVISION, HOSTED_PORTAL_VERSION, HostedPortalStore


class GoldSaucerHostedAlpha4Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = HostedPortalStore(Path(self.temp.name) / "mirror.db")
        self.store.upsert_player({
            "schema_version": 1, "username": "van", "player_twitch_id": "100",
            "snapshot": {"overview": {"identity": {"username": "van", "display_name": "Van", "level": 12, "title": "Fresh Recruit", "updated_at": "2026-08-31 00:00:00"}, "job": {"name": "Warrior"}, "status": {"state": "ready", "label": "Ready"}}, "jobs": {"jobs": []}, "inventory": {"items": []}, "hunts": {"summary": {}, "hunts": []}, "bestiary": {"summary": {"discovered": 0, "total": 0}, "monsters": []}, "relics": {"relics": []}, "achievements": {"summary": {"unlocked": 0, "total": 0}, "achievements": []}, "records": {"career": {}, "bosses": []}}
        })

    def tearDown(self):
        self.temp.cleanup()

    def test_alpha4_contract_adds_chocobo_race_action(self):
        self.assertEqual(HOSTED_PORTAL_VERSION, "1.7.0-retainer-a2")
        self.assertEqual(FRONTEND_ASSET_REVISION, "1.7.0-retainer-a2h2")
        self.assertEqual(ACTION_PROTOCOL_VERSION, 31)
        self.assertIn("CHOCOBO_RACE", ALLOWED_PORTAL_ACTIONS)

    def test_hosted_validator_bounds_racing_payload(self):
        action = self.store.create_action("100", "CHOCOBO_RACE", {"course": "crystal_circuit", "strategy": "balanced"}, "race-web-0001")
        self.assertEqual(action["type"], "CHOCOBO_RACE")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "CHOCOBO_RACE", {"course": "../../bad", "strategy": "balanced"}, "race-web-bad1")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "CHOCOBO_RACE", {"course": "crystal_circuit", "strategy": "turbo"}, "race-web-bad2")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "CHOCOBO_RACE", {"course": "crystal_circuit", "strategy": "balanced", "wager": 999}, "race-web-bad3")


if __name__ == "__main__":
    unittest.main()
