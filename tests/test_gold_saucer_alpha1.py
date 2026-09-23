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
    STREAMER_COMMAND_SPECS,
)


class GoldSaucerHostedAlpha1Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = HostedPortalStore(Path(self.temp.name) / "mirror.db")
        snapshot = {
            "schema_version": 1,
            "username": "van",
            "player_twitch_id": "100",
            "snapshot": {
                "overview": {
                    "identity": {"username": "van", "display_name": "Van", "level": 12, "title": "Fresh Recruit", "updated_at": "2026-08-31 00:00:00"},
                    "job": {"name": "Warrior"},
                    "status": {"state": "ready", "label": "Ready"},
                },
                "jobs": {"jobs": []}, "inventory": {"items": []}, "hunts": {"summary": {}, "hunts": []},
                "bestiary": {"summary": {"discovered": 0, "total": 0}, "monsters": []},
                "relics": {"relics": []}, "achievements": {"summary": {"unlocked": 0, "total": 0}, "achievements": []},
                "records": {"career": {}, "bosses": []},
            },
        }
        self.store.upsert_player(snapshot)

    def tearDown(self):
        self.temp.cleanup()

    def test_contract_and_capability_allowlist(self):
        self.assertEqual(HOSTED_PORTAL_VERSION, "1.9.0-records-moments-alpha10")
        self.assertEqual(FRONTEND_ASSET_REVISION, "1.9.0-records-moments-alpha10")
        self.assertEqual(ACTION_PROTOCOL_VERSION, 37)
        for action in {"GOLD_SAUCER_STATE", "CACTPOT_START", "CACTPOT_REVEAL", "CACTPOT_LINE", "SLOTS_SPIN", "SAUCER_BUY"}:
            self.assertIn(action, ALLOWED_PORTAL_ACTIONS)
        self.assertEqual(STREAMER_COMMAND_SPECS["saucergrant"], "text")
        self.assertEqual(STREAMER_COMMAND_SPECS["saucerreset"], "text")

    def test_gold_saucer_payload_validation_is_bounded(self):
        created = self.store.create_action("100", "GOLD_SAUCER_STATE", {}, "gold-state-0001")
        self.assertEqual(created["type"], "GOLD_SAUCER_STATE")
        reveal = self.store.create_action("100", "CACTPOT_REVEAL", {"cell": 8}, "gold-reveal-0001")
        self.assertEqual(reveal["type"], "CACTPOT_REVEAL")
        line = self.store.create_action("100", "CACTPOT_LINE", {"line": 7}, "gold-line-000001")
        self.assertEqual(line["type"], "CACTPOT_LINE")
        prize = self.store.create_action("100", "SAUCER_BUY", {"prize_id": "saucer_regular"}, "gold-prize-0001")
        self.assertEqual(prize["type"], "SAUCER_BUY")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "CACTPOT_REVEAL", {"cell": 9}, "gold-reveal-bad1")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "CACTPOT_LINE", {"line": -1}, "gold-line-bad001")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "SLOTS_SPIN", {"wager": 999}, "gold-slots-bad1")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "SAUCER_BUY", {"prize_id": "../../oops"}, "gold-prize-bad1")
