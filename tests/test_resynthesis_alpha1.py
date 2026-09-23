from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from crystal_guild.hosted_portal import (
    ACTION_PROTOCOL_VERSION,
    ALLOWED_PORTAL_ACTIONS,
    FRONTEND_ASSET_REVISION,
    HOSTED_PORTAL_VERSION,
    HostedPortalStore,
)


class ResynthesisHostedAlpha1Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = HostedPortalStore(Path(self.temp.name) / "mirror.db")
        self.store.upsert_player({
            "schema_version": 1,
            "username": "van",
            "player_twitch_id": "100",
            "snapshot": {
                "overview": {
                    "identity": {"username": "van", "display_name": "Van", "level": 12, "title": "Fresh Recruit", "updated_at": "2026-09-02 00:00:00"},
                    "job": {"name": "Warrior"},
                    "status": {"state": "ready", "label": "Ready"},
                },
                "jobs": {"jobs": []}, "inventory": {"items": []}, "hunts": {"summary": {}, "hunts": []},
                "bestiary": {"summary": {"discovered": 0, "total": 0}, "monsters": []},
                "relics": {"relics": []}, "achievements": {"summary": {"unlocked": 0, "total": 0}, "achievements": []},
                "records": {"career": {}, "bosses": []},
            },
        })

    def tearDown(self):
        self.temp.cleanup()

    def test_resynthesis_release_contract(self):
        self.assertEqual(HOSTED_PORTAL_VERSION, "1.9.0-records-moments-alpha10")
        self.assertEqual(FRONTEND_ASSET_REVISION, "1.9.0-records-moments-alpha10")
        self.assertEqual(ACTION_PROTOCOL_VERSION, 37)
        self.assertIn("RESYNTHESIZE_ITEM", ALLOWED_PORTAL_ACTIONS)

    def test_store_accepts_one_bounded_resynthesis_item_id(self):
        # Store validation is shared with the HTTP action endpoint.
        action = self.store.create_action("100", "RESYNTHESIZE_ITEM", {"item_id": "hunters_axe"}, "resynth-ok")
        self.assertEqual(action["type"], "RESYNTHESIZE_ITEM")
        claimed = self.store.claim_actions("resynthesis-test-worker", limit=1)
        self.assertEqual(claimed[0]["payload"], {"item_id": "hunters_axe"})
        with self.assertRaises(ValueError):
            self.store.create_action("100", "RESYNTHESIZE_ITEM", {"item_id": "hunter axe"}, "resynth-bad-space")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "RESYNTHESIZE_ITEM", {"item_id": "hunters_axe", "quantity": 1}, "resynth-extra")


if __name__ == "__main__":
    unittest.main()
