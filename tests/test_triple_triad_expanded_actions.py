"""Regression coverage for the expanded ladder's hosted action boundary."""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from crystal_guild.hosted_portal import HostedPortalStore


OPPONENTS = (
    "saucer_attendant", "chocobo_breeder", "moogle_dealer", "guild_adventurer",
    "card_shark", "monster_hunter", "tonberry_collector", "magitek_engineer",
    "crystal_master", "rift_scholar",
)


class ExpandedTriadHostedActionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = HostedPortalStore(Path(self.temp.name) / "mirror.db")
        self.store.upsert_player({
            "schema_version": 1, "username": "van", "player_twitch_id": "100",
            "snapshot": {"overview": {"identity": {
                "username": "van", "display_name": "Van", "level": 12,
            }, "job": {"name": "Warrior"}, "status": {"state": "ready", "label": "Ready"}}, "jobs": {}, "inventory": {}, "hunts": {}, "bestiary": {},
                "relics": {}, "achievements": {}, "records": {}},
        })

    def tearDown(self):
        self.temp.cleanup()

    def test_every_expanded_opponent_can_be_queued_and_claimed(self):
        for opponent in OPPONENTS:
            with self.subTest(opponent=opponent):
                action = self.store.create_action(
                    "100", "TRIAD_START", {"opponent": opponent}, "start-" + opponent,
                )
                claimed = self.store.claim_actions("triad-worker", limit=1)
                self.assertEqual(len(claimed), 1)
                self.assertEqual(claimed[0]["id"], action["id"])
                self.assertEqual(claimed[0]["payload"], {"opponent": opponent})
                self.assertTrue(self.store.complete_action(
                    action["id"], claimed[0]["lease_token"], True, "Match started.", {},
                ))

    def test_new_opponent_is_normalized_and_retry_is_idempotent(self):
        first = self.store.create_action(
            "100", "TRIAD_START", {"opponent": " CHOCOBO_BREEDER "}, "same-start",
        )
        retry = self.store.create_action(
            "100", "TRIAD_START", {"opponent": "chocobo_breeder"}, "same-start",
        )
        self.assertEqual(first["id"], retry["id"])
        claimed = self.store.claim_actions("triad-worker", limit=1)
        self.assertEqual(claimed[0]["payload"], {"opponent": "chocobo_breeder"})

    def test_unknown_opponents_and_extra_fields_are_rejected(self):
        for index, payload in enumerate((
            {"opponent": "omega"}, {"opponent": ""},
            {"opponent": "../../chocobo_breeder"},
            {"opponent": "chocobo_breeder", "unlocked": True},
        )):
            with self.subTest(payload=payload), self.assertRaises(ValueError):
                self.store.create_action("100", "TRIAD_START", payload, f"bad-{index}")
        self.assertEqual(self.store.list_actions("100"), [])


if __name__ == "__main__":
    unittest.main()
