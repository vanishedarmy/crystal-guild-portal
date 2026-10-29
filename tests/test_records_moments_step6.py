"""Hosted snapshot defense-in-depth: no partial sync may unseal a Moment."""
import json
import unittest
from crystal_guild.trophy_hall import build_trophy_hall


class Step6HostedMomentPrivacyTests(unittest.TestCase):
    def test_unowned_name_and_private_proof_are_removed_even_if_upstream_regresses(self):
        leaked = {
            "id": "moment_trophy_world_event_close_call", "name": "The Close Call",
            "category": "world_events", "description": "SECRET", "requirement": "secret rule",
            "art": "/trophies/a2/moments/world-event-close-call.webp",
            "locked_art": "/trophies/a2/moments/world-event-close-call-locked.webp",
            "earned": True, "evidence_json": "private battle log",
        }
        payload = build_trophy_hall({
            "overview": {"identity": {"username": "van"}},
            "trophies": {"unlocked": [], "moment_slots": [leaked]},
        })
        self.assertEqual(payload["moment_slots"][0]["id"], "sealed_trophy_slot_01")
        self.assertEqual(payload["moment_slots"][0]["category"], "mystery")
        self.assertEqual(payload["summary"], {"unlocked": 0, "total": 31})
        raw = json.dumps(payload)
        for secret in ("The Close Call", "moment_trophy_world_event_close_call", "SECRET",
                       "secret rule", "world-event-close-call", "private battle log"):
            self.assertNotIn(secret, raw)

    def test_real_earned_trophy_is_allowlisted_and_extraneous_evidence_is_dropped(self):
        trophy_id = "moment_trophy_raid_last_survivor"
        payload = build_trophy_hall({
            "overview": {"identity": {"username": "van"}},
            "trophies": {
                "unlocked": [
                    {"id": trophy_id, "unlocked_at": "2026-09-23"},
                    {"id": trophy_id, "unlocked_at": "2026-09-23"},
                ],
                "moment_slots": [{
                    "id": trophy_id, "name": "The Last Standing", "secret": True, "earned": True,
                    "category": "raids", "description": "Only survivor", "requirement": "Earn the Moment",
                    "art": "/trophies/a2/moments/raid-last-standing.webp", "locked_art": None,
                    "evidence_json": "private!", "admin_only": "token",
                }],
            },
        })
        self.assertEqual(payload["summary"], {"unlocked": 1, "total": 31})
        self.assertEqual(payload["moment_slots"][0]["name"], "The Last Standing")
        self.assertNotIn("private!", json.dumps(payload))
        self.assertNotIn("token", json.dumps(payload))
        self.assertEqual(len(payload["unlocked"]), 1)


if __name__ == "__main__":
    unittest.main()
