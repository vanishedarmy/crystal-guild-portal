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


class RetainerHostedAlpha1Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = HostedPortalStore(Path(self.temp.name) / "mirror.db")
        self.store.upsert_player({
            "schema_version": 1,
            "username": "van",
            "player_twitch_id": "100",
            "snapshot": {
                "overview": {
                    "identity": {"username": "van", "display_name": "Van", "level": 12, "title": "Fresh Recruit", "updated_at": "2026-09-01 00:00:00"},
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

    def test_retainer_contract_advances_release_and_protocol(self):
        self.assertEqual(HOSTED_PORTAL_VERSION, "1.9.0-seasonal-events-alpha8")
        self.assertEqual(FRONTEND_ASSET_REVISION, "1.9.0-seasonal-events-alpha8")
        self.assertEqual(ACTION_PROTOCOL_VERSION, 37)
        for action in ("RETAINER_STATE", "RETAINER_DISPATCH", "RETAINER_COLLECT"):
            self.assertIn(action, ALLOWED_PORTAL_ACTIONS)

    def test_retainer_payloads_are_strict_and_bounded(self):
        state = self.store.create_action("100", "RETAINER_STATE", {}, "retainer-state-web-1")
        self.assertEqual(state["type"], "RETAINER_STATE")
        dispatch = self.store.create_action("100", "RETAINER_DISPATCH", {"assignment": "field_gathering"}, "retainer-dispatch-web-1")
        self.assertEqual(dispatch["type"], "RETAINER_DISPATCH")
        collect = self.store.create_action("100", "RETAINER_COLLECT", {}, "retainer-collect-web-1")
        self.assertEqual(collect["type"], "RETAINER_COLLECT")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "RETAINER_STATE", {"player": "100"}, "retainer-state-web-bad")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "RETAINER_DISPATCH", {"assignment": "../../artifact"}, "retainer-dispatch-web-bad")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "RETAINER_COLLECT", {"force": True}, "retainer-collect-web-bad")


if __name__ == "__main__":
    unittest.main()
