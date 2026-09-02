from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from crystal_guild.hosted_portal import ACTION_PROTOCOL_VERSION, ALLOWED_PORTAL_ACTIONS, FRONTEND_ASSET_REVISION, HOSTED_PORTAL_VERSION, HostedPortalStore


class GoldSaucerHostedAlpha2Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = HostedPortalStore(Path(self.temp.name) / "mirror.db")
        self.store.upsert_player({
            "schema_version": 1, "username": "van", "player_twitch_id": "100",
            "snapshot": {"overview": {"identity": {"username": "van", "display_name": "Van", "level": 12, "title": "Fresh Recruit", "updated_at": "2026-08-31 00:00:00"}, "job": {"name": "Warrior"}, "status": {"state": "ready", "label": "Ready"}}, "jobs": {"jobs": []}, "inventory": {"items": []}, "hunts": {"summary": {}, "hunts": []}, "bestiary": {"summary": {"discovered": 0, "total": 0}, "monsters": []}, "relics": {"relics": []}, "achievements": {"summary": {"unlocked": 0, "total": 0}, "achievements": []}, "records": {"career": {}, "bosses": []}}
        })

    def tearDown(self):
        self.temp.cleanup()

    def test_alpha2_contract_and_actions(self):
        self.assertEqual(HOSTED_PORTAL_VERSION, "1.7.0-retainer-a2")
        self.assertEqual(FRONTEND_ASSET_REVISION, "1.7.0-retainer-a2h3")
        self.assertEqual(ACTION_PROTOCOL_VERSION, 31)
        self.assertIn("MONSTER_TOSS_START", ALLOWED_PORTAL_ACTIONS)
        self.assertIn("MONSTER_TOSS_THROW", ALLOWED_PORTAL_ACTIONS)

    def test_hosted_validator_bounds_monster_toss_payload(self):
        started = self.store.create_action("100", "MONSTER_TOSS_START", {}, "toss-start-0001")
        self.assertEqual(started["type"], "MONSTER_TOSS_START")
        thrown = self.store.create_action("100", "MONSTER_TOSS_THROW", {"target": "golden_cactuar", "style": "power"}, "toss-throw-0001")
        self.assertEqual(thrown["type"], "MONSTER_TOSS_THROW")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "MONSTER_TOSS_THROW", {"target": "../../bad", "style": "power"}, "toss-bad-0001")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "MONSTER_TOSS_THROW", {"target": "small_pot", "style": "cheat"}, "toss-bad-0002")


if __name__ == "__main__":
    unittest.main()
