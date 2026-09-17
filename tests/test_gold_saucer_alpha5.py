from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from crystal_guild.hosted_portal import ACTION_PROTOCOL_VERSION, ALLOWED_PORTAL_ACTIONS, FRONTEND_ASSET_REVISION, HOSTED_PORTAL_VERSION, HostedPortalStore


class GoldSaucerHostedAlpha5Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = HostedPortalStore(Path(self.temp.name) / "mirror.db")
        self.store.upsert_player({
            "schema_version": 1, "username": "van", "player_twitch_id": "100",
            "snapshot": {"overview": {"identity": {"username": "van", "display_name": "Van", "level": 12, "title": "Fresh Recruit", "updated_at": "2026-08-31 00:00:00"}, "job": {"name": "Warrior"}, "status": {"state": "ready", "label": "Ready"}}, "jobs": {"jobs": []}, "inventory": {"items": []}, "hunts": {"summary": {}, "hunts": []}, "bestiary": {"summary": {"discovered": 0, "total": 0}, "monsters": []}, "relics": {"relics": []}, "achievements": {"summary": {"unlocked": 0, "total": 0}, "achievements": []}, "records": {"career": {}, "bosses": []}}
        })

    def tearDown(self):
        self.temp.cleanup()

    def test_alpha5_contract_adds_triple_triad_actions(self):
        self.assertEqual(HOSTED_PORTAL_VERSION, "1.8.0-merc-rc1")
        self.assertEqual(FRONTEND_ASSET_REVISION, "1.8.0-merc-rc1")
        self.assertEqual(ACTION_PROTOCOL_VERSION, 34)
        for action in ("TRIAD_SET_DECK", "TRIAD_START", "TRIAD_PLAY"):
            self.assertIn(action, ALLOWED_PORTAL_ACTIONS)

    def test_triad_deck_and_start_payloads_are_bounded(self):
        deck = ["chocobo", "moogle", "cactuar", "bomb", "flan"]
        action = self.store.create_action("100", "TRIAD_SET_DECK", {"cards": deck}, "triad-web-deck-1")
        self.assertEqual(action["type"], "TRIAD_SET_DECK")
        start = self.store.create_action("100", "TRIAD_START", {"opponent": "saucer_attendant"}, "triad-web-start-1")
        self.assertEqual(start["type"], "TRIAD_START")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "TRIAD_SET_DECK", {"cards": ["chocobo"] * 5}, "triad-web-bad-deck")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "TRIAD_SET_DECK", {"cards": deck + ["tonberry"]}, "triad-web-long-deck")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "TRIAD_START", {"opponent": "omega"}, "triad-web-bad-opponent")

    def test_triad_play_payload_binds_card_and_board_cell(self):
        action = self.store.create_action("100", "TRIAD_PLAY", {"card": "chocobo", "cell": 4}, "triad-web-play-1")
        self.assertEqual(action["type"], "TRIAD_PLAY")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "TRIAD_PLAY", {"card": "../../bad", "cell": 4}, "triad-web-bad-card")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "TRIAD_PLAY", {"card": "chocobo", "cell": 9}, "triad-web-bad-cell")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "TRIAD_PLAY", {"card": "chocobo", "cell": 4, "owner": "player"}, "triad-web-extra")


if __name__ == "__main__":
    unittest.main()
