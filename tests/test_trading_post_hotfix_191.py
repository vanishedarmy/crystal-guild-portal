"""Regressions for oversized Alpha 13 market results and SQLite storage."""
import json
import sqlite3
import tempfile
import time
import unittest
from pathlib import Path

from crystal_guild.hosted_portal import HostedPortalStore, MAX_ACTION_RESULT_BYTES


class TradingPostLargeResultTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "portal.db"
        self.store = HostedPortalStore(self.path)
        self.store.upsert_player({
            "schema_version": 1, "username": "seller", "player_twitch_id": "100",
            "snapshot": {
                "overview": {"identity": {"username": "seller", "display_name": "Seller", "level": 1,
                                          "title": "Recruit", "updated_at": "2026-09-24 00:00:00"},
                             "job": {"name": "Warrior"}, "status": {"state": "ready", "label": "Ready"}},
                "jobs": {"jobs": []}, "inventory": {"items": []},
                "hunts": {"summary": {}, "hunts": []},
                "bestiary": {"summary": {"discovered": 0, "total": 0}, "monsters": []},
                "relics": {"relics": []}, "achievements": {"summary": {"unlocked": 0, "total": 0}, "achievements": []},
                "records": {"career": {}, "bosses": []},
            },
        })

    def tearDown(self):
        self.tmp.cleanup()

    def claim(self, key):
        action = self.store.create_action("100", "TRADING_POST_STATE", {}, key)
        claimed = self.store.claim_actions("bot:test", limit=1, lease_seconds=30)
        self.assertEqual(len(claimed), 1)
        return action, claimed[0]

    def test_large_market_round_trips_with_compressed_sqlite_storage(self):
        action, claim = self.claim("large-market")
        data = {"unlocked": True, "catalog_items": [{"id": f"item_{i}", "name": "Mythril Ore"} for i in range(324)],
                "listings": [{"id": i, "item": {"id": "iron_ore", "name": "Iron Ore", "description": "A crafting material " * 15},
                              "unit_price": 125, "quantity": 2, "seller_name": "Player"} for i in range(200)],
                "my_listings": [], "recent_sales": []}
        uncompressed = len(json.dumps({"ok": True, "message": "Ready", "data": data}, separators=(",", ":"),
                                      sort_keys=True, ensure_ascii=False).encode())
        self.assertGreater(uncompressed, 64 * 1024)  # old relay rejects it
        self.assertLess(uncompressed, MAX_ACTION_RESULT_BYTES)
        self.assertTrue(self.store.complete_action(action["id"], claim["lease_token"], True, "Ready", data))
        with sqlite3.connect(self.path) as conn:
            stored = conn.execute("SELECT result_json FROM portal_actions WHERE action_id=?", (action["id"],)).fetchone()[0]
        self.assertTrue(stored.startswith("z1:"), "big states should not fill hosted disk with redundant JSON")
        self.assertLess(len(stored), uncompressed // 2)
        result = self.store.action_for_user("100", action["id"])
        self.assertEqual(result["status"], "completed")
        self.assertEqual(len(result["result"]["data"]["listings"]), 200)

    def test_result_over_budget_rejected_without_corrupting_pending_action(self):
        action, claim = self.claim("large-too-big")
        data = {"incompressible_limit_guard": "X" * (MAX_ACTION_RESULT_BYTES + 100)}
        with self.assertRaisesRegex(ValueError, "too large"):
            self.store.complete_action(action["id"], claim["lease_token"], True, "Ready", data)
        self.assertEqual(self.store.action_for_user("100", action["id"])["status"], "processing")

    def test_old_plain_json_rows_remain_readable(self):
        action, claim = self.claim("small-result")
        self.assertTrue(self.store.complete_action(action["id"], claim["lease_token"], True, "Ready", {"listings": []}))
        with sqlite3.connect(self.path) as conn:
            self.assertTrue(conn.execute("SELECT result_json FROM portal_actions WHERE action_id=?", (action["id"],)).fetchone()[0].startswith("{"))
        self.assertEqual(self.store.action_for_user("100", action["id"])["result"]["data"]["listings"], [])

    def test_old_read_only_snapshots_are_pruned_but_mutation_receipts_remain(self):
        state, state_lease = self.claim("old-market-state")
        self.assertTrue(self.store.complete_action(state["id"], state_lease["lease_token"], True, "Ready", {"listings": []}))
        mutation = self.store.create_action("100", "PING", {}, "old-mutation-receipt")
        mutation_lease = self.store.claim_actions("bot:test", limit=1)[0]
        self.assertTrue(self.store.complete_action(mutation["id"], mutation_lease["lease_token"], True, "Ping", {}))
        old = int(time.time()) - 26 * 60 * 60
        with sqlite3.connect(self.path) as conn:
            conn.execute("UPDATE portal_actions SET updated_at=? WHERE action_id IN (?,?)",
                         (old, state["id"], mutation["id"]))
        # A new action invokes routine ledger maintenance without a manual
        # VACUUM and without deleting old mutation/idempotency records.
        self.store.create_action("100", "PING", {}, "new-action-for-pruning")
        self.assertIsNone(self.store.action_for_user("100", state["id"]))
        self.assertEqual(self.store.action_for_user("100", mutation["id"])["status"], "completed")


if __name__ == "__main__":
    unittest.main()
