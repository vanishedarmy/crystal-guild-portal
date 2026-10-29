"""Alpha 13 hosted relay input guards and capabilities."""
import tempfile
import unittest
from pathlib import Path
from crystal_guild.hosted_portal import HostedPortalStore, ACTION_PROTOCOL_VERSION, ALLOWED_PORTAL_ACTIONS

class TradingPostAlpha13HostedTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.store=HostedPortalStore(Path(self.tmp.name)/"hosted.db")
        self.store.upsert_player({"schema_version":1,"username":"seller","player_twitch_id":"100","snapshot":{
            "overview":{"identity":{"username":"seller","display_name":"Seller","level":1,"title":"Recruit","updated_at":"2026-09-24 00:00:00"},"job":{"name":"Warrior"},"status":{"state":"ready","label":"Ready"}},
            "jobs":{"jobs":[]},"inventory":{"items":[]},"hunts":{"summary":{},"hunts":[]},
            "bestiary":{"summary":{"discovered":0,"total":0},"monsters":[]},"relics":{"relics":[]},
            "achievements":{"summary":{"unlocked":0,"total":0},"achievements":[]},"records":{"career":{},"bosses":[]}}})

    def tearDown(self): self.tmp.cleanup()

    def test_watch_and_history_strict_payloads(self):
        self.assertEqual(ACTION_PROTOCOL_VERSION,39)
        self.assertTrue({"TRADING_POST_HISTORY","TRADING_POST_WATCH"} <= ALLOWED_PORTAL_ACTIONS)
        self.assertEqual(self.store.create_action("100","TRADING_POST_WATCH",{"item_id":"iron_ore","watched":True},"watch-valid")["type"],"TRADING_POST_WATCH")
        self.assertEqual(self.store.create_action("100","TRADING_POST_HISTORY",{"item_id":"iron_ore"},"history-valid")["type"],"TRADING_POST_HISTORY")
        for index,bad in enumerate(({}, {"item_id":"iron_ore"},{"item_id":"iron_ore","watched":1},{"item_id":"iron_ore","watched":"true"},
                                    {"item_id":"iron_ore","watched":True,"player_id":"200"},
                                    {"item_id":"../items","watched":True})):
            with self.subTest(bad=bad),self.assertRaises(ValueError):
                self.store.create_action("100","TRADING_POST_WATCH",bad,f"watch-bad-{index}")
        for index,bad in enumerate(({}, {"item_id":"iron_ore","limit":99999},{"item_id":"other bad id"})):
            with self.subTest(bad=bad),self.assertRaises(ValueError):
                self.store.create_action("100","TRADING_POST_HISTORY",bad,f"history-bad-{index}")

if __name__=="__main__": unittest.main()
