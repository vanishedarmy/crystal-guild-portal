from __future__ import annotations
from contextlib import closing

import copy
import json
import sqlite3
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from crystal_guild.queens_blood import (
    CARDS, DECK, RuleError, affected, ai_move, apply_action, legal_moves,
    new_match, powers, public_match, scores, validate_deck,
)
from crystal_guild.queens_blood_store import MatchConflict, QueensBloodStore
from crystal_guild.hosted_portal import HostedPortalHandler, HostedPortalHTTPServer, HostedPortalStore
from crystal_guild.portal_auth import TwitchOAuthConfig


def opened():
    return apply_action(new_match("tutorial", seed=42), 0, {"kind": "mulligan", "indices": []})


class RulesTests(unittest.TestCase):
    def test_initial_board_and_hand(self):
        s = new_match()
        self.assertEqual([len(h) for h in s["hands"]], [5, 5])
        self.assertEqual([len(d) for d in s["decks"]], [10, 10])
        self.assertEqual(sum(t["rank"] for row in s["board"] for t in row), 6)
        self.assertEqual(legal_moves(s), [])

    def test_deck_validation(self):
        validate_deck(DECK)
        for invalid in [DECK[:14], ["missing"] * 15, ["QB001"] * 15]:
            with self.subTest(deck=invalid), self.assertRaises(RuleError): validate_deck(invalid)

    def test_seeded_practice_and_disclosed_tutorial(self):
        a, b = new_match("practice", 2), new_match("practice", 2)
        self.assertEqual(a["hands"], b["hands"])
        self.assertEqual(new_match()["hands"][0], DECK[:5])

    def test_mulligan_returns_cards_without_loss(self):
        s = new_match(seed=2)
        t = apply_action(s, 0, {"kind": "mulligan", "indices": [0, 2, 4]})
        self.assertEqual(sorted(t["hands"][0] + t["decks"][0]), sorted(DECK))
        self.assertEqual(len(t["hands"][0]), 5)
        self.assertEqual(t["phase"], "play")
        self.assertEqual(s["phase"], "mulligan")

    def test_invalid_mulligans_and_second_exchange(self):
        for indices in [[0, 0], [True], [-1], [5], [1.0], "all"]:
            with self.subTest(indices=indices), self.assertRaises(RuleError):
                apply_action(new_match(), 0, {"kind": "mulligan", "indices": indices})
        with self.assertRaises(RuleError): apply_action(opened(), 0, {"kind": "mulligan", "indices": []})

    def test_first_turn_draw_and_immutability(self):
        s = opened(); before = copy.deepcopy(s)
        t = apply_action(s, 0, {"kind": "play", "hand": 0, "row": 1, "col": 0})
        self.assertEqual(s, before)
        self.assertEqual(len(t["hands"][0]), 4)
        self.assertEqual(len(t["hands"][1]), 6)
        self.assertEqual(t["board"][1][1]["owner"], 0)
        self.assertEqual(t["board"][0][0]["rank"], 2)
        self.assertEqual(t["board"][2][0]["rank"], 2)

    def test_wrong_turn_and_invalid_placement_no_mutation(self):
        s = opened(); before = copy.deepcopy(s)
        invalids = [{"kind": "play", "hand": 0, "row": 0, "col": 4},
                    {"kind": "play", "hand": True, "row": 0, "col": 0},
                    {"kind": "play", "hand": 0, "row": 3, "col": 0},
                    {"kind": "play", "hand": 0, "row": 0, "col": -1},
                    {"kind": "pass", "unexpected": 1}]
        for action in invalids:
            with self.subTest(action=action), self.assertRaises(RuleError): apply_action(s, 0, action)
        with self.assertRaises(RuleError): apply_action(s, 1, {"kind": "pass"})
        self.assertEqual(s, before)

    def test_rank_requirement(self):
        s = opened(); s["hands"][0] = ["QB015"]
        self.assertEqual(legal_moves(s), [])
        s["board"][1][0]["rank"] = 3
        self.assertEqual(len(legal_moves(s)), 1)

    def test_mirror_and_edges(self):
        self.assertEqual(affected(0, 4, 1, [(0, 1), (-1, 0), (1, 0)]), [(0, 3), (1, 4)])
        self.assertEqual(affected(2, 0, 0, [(0, -1), (1, 0), (-1, 0)]), [(1, 0)])
        s = opened(); s["turn"] = 1
        t = apply_action(s, 1, {"kind": "play", "hand": 0, "row": 1, "col": 4})
        self.assertEqual(t["board"][1][3]["owner"], 1)

    def test_capture_preserves_rank_and_occupied_card(self):
        s = opened(); s["board"][1][1].update(owner=1, rank=3)
        s["board"][0][0].update(owner=1, rank=2, card="QB003")
        t = apply_action(s, 0, {"kind": "play", "hand": 0, "row": 1, "col": 0})
        self.assertEqual((t["board"][1][1]["owner"], t["board"][1][1]["rank"]), (0, 3))
        self.assertEqual(t["board"][0][0]["owner"], 1)

    def test_rank_cap(self):
        s = opened(); s["board"][0][0]["rank"] = 3
        t = apply_action(s, 0, {"kind": "play", "hand": 0, "row": 1, "col": 0})
        self.assertEqual(t["board"][0][0]["rank"], 3)

    def test_lane_winner_scoring_and_ties(self):
        s = opened()
        for r, pair in enumerate([(5, 7), (15, 4), (3, 7)]):
            for side, value in enumerate(pair):
                s["board"][r][side * 4].update(owner=side, card="QB003", bonus=value - 2)
        self.assertEqual(scores(s)["totals"], [15, 14])
        s["board"][0][0]["bonus"] = 5
        self.assertEqual(scores(s)["lanes"][0]["awarded"], [0, 0])

    def test_pass_is_temporary_and_play_resets_passes(self):
        s = apply_action(opened(), 0, {"kind": "pass"})
        s = apply_action(s, 1, {"kind": "play", "hand": 0, "row": 1, "col": 4})
        self.assertEqual(s["passes"], 0)
        self.assertEqual(s["turn"], 0)
        self.assertEqual(s["phase"], "play")

    def test_two_passes_and_empty_deck(self):
        s = opened(); s["decks"] = [[], []]
        s = apply_action(s, 0, {"kind": "pass"})
        self.assertEqual(len(s["hands"][1]), 5)
        s = apply_action(s, 1, {"kind": "pass"})
        self.assertEqual(s["phase"], "finished")
        self.assertIsNone(s["winner"])
        with self.assertRaises(RuleError): apply_action(s, 0, {"kind": "pass"})

    def test_resign_during_opening(self):
        s = apply_action(new_match(), 0, {"kind": "resign"})
        self.assertEqual((s["phase"], s["winner"], s["reason"]), ("finished", 1, "resigned"))

    def test_moogle_aura_and_later_arrival(self):
        s = opened(); s["hands"][0] = ["QB002", "QB003"]
        s = apply_action(s, 0, {"kind": "play", "hand": 0, "row": 1, "col": 0})
        s["turn"] = 0
        s = apply_action(s, 0, {"kind": "play", "hand": 0, "row": 0, "col": 0})
        self.assertEqual(powers(s)[0][0], 3)
        s["board"][1][0]["card"] = None
        self.assertEqual(powers(s)[0][0], 2)

    def test_white_mage_existing_targets_only(self):
        s = opened(); s["hands"][0] = ["QB009"]
        s["board"][0][0].update(card="QB003", owner=0)
        t = apply_action(s, 0, {"kind": "play", "hand": 0, "row": 1, "col": 0})
        self.assertEqual(powers(t)[0][0], 3)
        t["board"][2][0].update(card="QB003", owner=0)
        self.assertEqual(powers(t)[2][0], 2)

    def test_private_projection_and_legal_preview(self):
        s = opened(); p = public_match(s)
        for secret in ("decks", "hands", "mulligan_seed"):
            self.assertNotIn(secret, p)
        self.assertEqual(p["hand"], s["hands"][0])
        self.assertNotIn("opponent_hand", p)
        move = p["legal"][0]
        t = apply_action(s, 0, {k: move[k] for k in ("kind", "hand", "row", "col")})
        self.assertEqual(move["scores"], scores(t))

    def test_preview_captured_rank_and_malformed_action(self):
        s = opened(); s["board"][1][1].update(owner=1, rank=3)
        move = next(m for m in public_match(s)["legal"] if m["hand"] == 0 and m["row"] == 1 and m["col"] == 0)
        self.assertIn({"row": 1, "col": 1, "owner": 0, "rank": 3}, move["territory"])
        with self.assertRaises(RuleError): apply_action(s, 0, {"kind": []})
        with self.assertRaises(RuleError): new_match([])

    def test_ai_does_not_depend_on_enemy_hand(self):
        s = opened(); s["turn"] = 1
        move = ai_move(s)
        s["hands"][0] = ["QB015"] * 3; s["decks"][0] = []
        self.assertEqual(ai_move(s), move)

    def test_full_seeded_matches_terminate_and_preserve_cards(self):
        for seed in range(40):
            s = apply_action(new_match("practice", seed), 0, {"kind": "mulligan", "indices": []})
            for _ in range(40):
                if s["phase"] == "finished": break
                side = s["turn"]
                moves = legal_moves(s)
                action = ai_move(s) if side == 1 else moves[0] if moves else {"kind": "pass"}
                s = apply_action(s, side, action)
                for player in (0, 1):
                    board = [t["card"] for row in s["board"] for t in row if t["card"] and t["owner"] == player]
                    self.assertEqual(sorted(board + s["hands"][player] + s["decks"][player]), sorted(DECK))
            self.assertEqual(s["phase"], "finished")


class StoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / "portal.db"
        self.store = QueensBloodStore(self.path)

    def tearDown(self): self.temp.cleanup()

    def start(self, user="1", key="start-key-1"):
        return self.store.submit(user, key, {"match_id": None, "revision": 0, "action": {"kind": "start", "mode": "tutorial"}})

    @staticmethod
    def command(response, action):
        m = response["match"]
        return {"match_id": m["id"], "revision": m["revision"], "action": action}

    def test_restart_and_player_isolation(self):
        a = self.start()
        self.assertEqual(QueensBloodStore(self.path).get("1")["match"], a["match"])
        self.assertIsNone(self.store.get("2")["match"])
        with self.assertRaises(MatchConflict): self.store.submit("2", "other-key-1", self.command(a, {"kind": "pass"}))

    def test_replay_and_payload_mismatch(self):
        a = self.start(); self.assertEqual(self.start(), a)
        with self.assertRaises(MatchConflict):
            self.store.submit("1", "start-key-1", {"match_id": None, "revision": 0, "action": {"kind": "start", "mode": "practice"}})

    def test_stale_move_and_active_start(self):
        a = self.start()
        with self.assertRaises(MatchConflict): self.store.submit("1", "restart-key", self.command(a, {"kind": "start", "mode": "practice"}))
        b = self.store.submit("1", "opening-key", self.command(a, {"kind": "mulligan", "indices": []}))
        with self.assertRaises(MatchConflict): self.store.submit("1", "stale-key-1", self.command(a, {"kind": "pass"}))
        self.assertEqual(self.store.get("1"), b)

    def test_atomic_duplicate_across_connections(self):
        a = self.start(); command = self.command(a, {"kind": "mulligan", "indices": []})
        def submit(_): return QueensBloodStore(self.path).submit("1", "parallel-key", command)
        with ThreadPoolExecutor(max_workers=4) as pool: results = list(pool.map(submit, range(4)))
        self.assertTrue(all(r == results[0] for r in results))
        self.assertEqual(self.store.get("1")["match"]["revision"], 1)

    def test_ai_move_and_exact_retry(self):
        a = self.start(); a = self.store.submit("1", "opening-key", self.command(a, {"kind": "mulligan", "indices": []}))
        move = {k: a["match"]["legal"][0][k] for k in ("kind", "hand", "row", "col")}
        request = self.command(a, move)
        b = self.store.submit("1", "play-key-11", request)
        self.assertEqual(b["match"]["revision"], 3)
        self.assertEqual(b["match"]["turn"], 0)
        self.assertEqual(self.store.submit("1", "play-key-11", request), b)

    def test_invalid_move_rolls_back(self):
        a = self.start()
        with self.assertRaises(RuleError): self.store.submit("1", "invalid-key", self.command(a, {"kind": "play", "hand": 0, "row": 0, "col": 0}))
        self.assertEqual(self.store.get("1")["match"], a["match"])
        with closing(sqlite3.connect(self.path)) as c, c:
            self.assertEqual(c.execute("SELECT count(*) FROM qb_requests").fetchone()[0], 1)


class HttpTests(unittest.TestCase):
    def setUp(self):
        # Existing portal snapshot fixture provides a real recruited session.
        from test_portal_actions import snapshot_payload
        self.temp = tempfile.TemporaryDirectory(); root = Path(self.temp.name)
        self.store = HostedPortalStore(root / "mirror.db")
        self.store.upsert_player(snapshot_payload())
        self.token, self.csrf = self.store.create_session({"twitch_id": "987654321", "login": "van", "display_name": "Van"}, 3600)
        config = TwitchOAuthConfig("client", "secret", "https://example.test/auth/twitch/callback", cookie_secure=False)
        self.server = HostedPortalHTTPServer(("127.0.0.1", 0), HostedPortalHandler, self.store, root, "sync-key", oauth_config=config)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True); self.thread.start()
        self.url = f"http://127.0.0.1:{self.server.server_address[1]}/api/card-hall"

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join(2); self.temp.cleanup()

    def request(self, payload=None, signed=True, csrf=True):
        headers = {"Cookie": f"cg_session={self.token}"} if signed else {}
        if csrf: headers["X-Crystal-Guild-CSRF"] = self.csrf
        headers.update({"Idempotency-Key": "http-start-1", "Content-Type": "application/json"})
        req = urllib.request.Request(self.url, data=json.dumps(payload).encode() if payload is not None else None, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=3) as response: return response.status, dict(response.headers), json.load(response)
        except urllib.error.HTTPError as e: return e.code, dict(e.headers), json.load(e)

    def test_auth_csrf_offline_and_disabled_admin(self):
        command = {"match_id": None, "revision": 0, "action": {"kind": "start", "mode": "tutorial"}}
        self.assertEqual(self.request(signed=False)[0], 401)
        self.assertEqual(self.request(command, csrf=False)[0], 403)
        status, headers, data = self.request(command)
        self.assertEqual(status, 200)
        self.assertIn("no-store", headers["Cache-Control"])
        self.assertIsNotNone(data["match"])
        self.server.actions_enabled = False
        self.assertEqual(self.request(command)[0], 503)
        self.assertFalse(self.request()[2]["play_enabled"])

    def test_bad_payload_and_no_player(self):
        self.assertEqual(self.request({"player_id": "someone-else"})[0], 400)
        self.assertEqual(self.request({"match_id": None, "revision": 0, "action": {"kind": "start", "mode": []}})[0], 400)
        self.token, self.csrf = self.store.create_session({"twitch_id": "111", "login": "unrecruited", "display_name": "Other"}, 3600)
        self.assertEqual(self.request()[0], 403)


if __name__ == "__main__": unittest.main()
