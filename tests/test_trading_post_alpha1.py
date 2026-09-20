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


class TradingPostHostedAlpha1Tests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.store = HostedPortalStore(Path(self.tmp.name) / "mirror.db")
        for twitch_id, username in (("100", "seller"), ("200", "buyer")):
            self.store.upsert_player({
                "schema_version": 1,
                "username": username,
                "player_twitch_id": twitch_id,
                "snapshot": {
                    "overview": {
                        "identity": {"username": username, "display_name": username.title(), "level": 1, "title": "Recruit", "updated_at": "2026-09-20 12:00:00"},
                        "job": {"name": "Warrior"},
                        "status": {"state": "ready", "label": "Ready"},
                    },
                    "jobs": {"jobs": []},
                    "inventory": {"items": []},
                    "hunts": {"summary": {}, "hunts": []},
                    "bestiary": {"summary": {"discovered": 0, "total": 0}, "monsters": []},
                    "relics": {"relics": []},
                    "achievements": {"summary": {"unlocked": 0, "total": 0}, "achievements": []},
                    "records": {"career": {}, "bosses": []},
                },
            })

    def tearDown(self):
        self.tmp.cleanup()

    def test_release_contract_and_actions(self):
        self.assertEqual(HOSTED_PORTAL_VERSION, "1.9.0-economy-balance-alpha2")
        self.assertEqual(FRONTEND_ASSET_REVISION, "1.9.0-economy-balance-alpha2")
        self.assertEqual(ACTION_PROTOCOL_VERSION, 36)
        for kind in {"TRADING_POST_STATE", "TRADING_POST_LIST", "TRADING_POST_BUY", "TRADING_POST_CANCEL"}:
            self.assertIn(kind, ALLOWED_PORTAL_ACTIONS)

    def test_trading_post_payload_validation(self):
        state = self.store.create_action("100", "TRADING_POST_STATE", {}, "market-state:100")
        self.assertEqual(state["type"], "TRADING_POST_STATE")

        listed = self.store.create_action(
            "100", "TRADING_POST_LIST",
            {"item_id": "iron_ore", "quantity": "4", "unit_price": "125"},
            "market-list:100",
        )
        self.assertEqual(listed["type"], "TRADING_POST_LIST")

        bought = self.store.create_action("200", "TRADING_POST_BUY", {"listing_id": "7"}, "market-buy:200")
        self.assertEqual(bought["type"], "TRADING_POST_BUY")

        with self.assertRaises(ValueError):
            self.store.create_action("100", "TRADING_POST_LIST", {"item_id": "iron_ore", "quantity": 100, "unit_price": 1}, "market-bad:100")
        with self.assertRaises(ValueError):
            self.store.create_action("100", "TRADING_POST_BUY", {"listing_id": 0}, "market-badbuy:100")


if __name__ == "__main__":
    unittest.main()
