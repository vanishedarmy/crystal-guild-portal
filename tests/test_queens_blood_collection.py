from contextlib import closing
import copy
import json
import sqlite3
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

from crystal_guild.queens_blood import CARDS, LEGACY_CARDS, RuleError, apply_action, new_match, powers, validate_deck
from crystal_guild.queens_blood_catalog import CATALOG, COLLECTION, OPPONENTS, PLAYABLE, STARTER
from crystal_guild.queens_blood_store import MatchConflict, QueensBloodStore


class CollectionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.path = Path(self.temp.name) / "portal.db"
        self.store = QueensBloodStore(self.path); self.counter = 0

    def tearDown(self): self.temp.cleanup()

    def command(self, action, snapshot=None, key=None):
        snapshot = snapshot or self.store.get("1"); state = snapshot["match"]
        self.counter += 1
        return self.store.submit("1", key or f"collection-key-{self.counter}", {
            "match_id": state["id"] if state else None, "revision": state["revision"] if state else 0, "action": action})

    def save(self, cards=None, name="My Deck", slot=0, revision=None):
        profile = self.store.get("1")["profile"]
        return self.command({"kind": "save_deck", "slot": slot, "name": name,
            "cards": list(STARTER if cards is None else cards),
            "profile_revision": profile["revision"] if revision is None else revision})

    def finish_fixture(self, opponent, winner=0):
        # A prepared final-turn position tests settlement through the real endpoint contract.
        response = self.command({"kind": "start", "mode": "circuit", "opponent": opponent})
        with closing(sqlite3.connect(self.path)) as conn, conn:
            state = json.loads(conn.execute("SELECT state_json FROM qb_matches WHERE player_id='1'").fetchone()[0])
            state.update(phase="play", hands=[[], []], decks=[[], []])
            if winner is not None: state["board"][1][0 if winner == 0 else 4].update(owner=winner, card="QB001")
            conn.execute("UPDATE qb_matches SET state_json=? WHERE player_id='1'", (json.dumps(state),))
        payload = {"match_id": state["id"], "revision": state["revision"], "action": {"kind": "pass"}}
        return response, payload

    def test_catalog_and_solo_coverage(self):
        self.assertEqual((len(COLLECTION), len(PLAYABLE)), (48, 48))
        self.assertEqual(set(PLAYABLE), set(STARTER) | {id for o in OPPONENTS.values() for id in o["rewards"]})
        self.assertTrue(all(len(o["deck"]) == 15 for o in OPPONENTS.values()))

    def test_initial_collection_and_slots(self):
        response = self.store.get("1")
        self.assertEqual(len(response["profile"]["unlocked"]), 9)
        self.assertEqual(len(response["profile"]["decks"]), 3)
        self.assertEqual([o["unlocked"] for o in response["opponents"]], [True] + [False] * (len(OPPONENTS) - 1))
        self.assertEqual(sum(c["owned"] for c in response["cards"]), 9)

    def test_invalid_count_duplicate_hero_unowned_and_gated(self):
        for invalid in [STARTER[:-1], ["QB001"] * 15, ["QB017"] * 2 + STARTER[:13], ["QB007"] + STARTER[:14]]:
            with self.subTest(deck=invalid), self.assertRaises(RuleError): self.save(invalid)
        with self.assertRaises(RuleError): self.save(["QB005"] + STARTER[:14])
        with self.assertRaises(RuleError): self.save(name="\nBad")
        with self.assertRaises(RuleError): self.save(slot=True)

    def test_save_activate_and_restart(self):
        response = self.save(name="Night Watch", slot=1)
        self.assertEqual(response["profile"]["revision"], 1)
        response = self.command({"kind": "activate_deck", "slot": 1, "profile_revision": 1})
        self.assertEqual(response["profile"]["active_deck"], 1)
        self.assertEqual(QueensBloodStore(self.path).get("1")["profile"], response["profile"])
        self.assertEqual(self.store.get("2")["profile"]["revision"], 0)

    def test_stale_profile_edits_and_start(self):
        self.save(name="New")
        with self.assertRaises(MatchConflict): self.save(name="Stale", revision=0)
        with self.assertRaises(MatchConflict): self.command({"kind": "start", "mode": "practice", "profile_revision": 0})
        self.assertEqual(self.store.get("1")["profile"]["decks"][0]["name"], "New")

    def test_active_match_keeps_original_deck_and_catalog(self):
        self.command({"kind": "start", "mode": "practice"})
        with closing(sqlite3.connect(self.path)) as conn, conn:
            original = json.loads(conn.execute("SELECT state_json FROM qb_matches WHERE player_id='1'").fetchone()[0])
        deck = list(STARTER); deck[-1] = "QB011"
        self.save(deck, "Edited during match")
        with closing(sqlite3.connect(self.path)) as conn, conn:
            current = json.loads(conn.execute("SELECT state_json FROM qb_matches WHERE player_id='1'").fetchone()[0])
        self.assertEqual(original["hands"], current["hands"])
        self.assertEqual(original["decks"], current["decks"])
        current["board"][0][0].update(card="QB001", owner=0)
        with patch.dict(CARDS["QB001"], {"power": 999}): self.assertEqual(powers(current)[0][0], 2)

    def test_legacy_qb1_match_and_text_request_survive(self):
        state = new_match(); state.pop("card_snapshot"); state.pop("catalog_revision")
        with closing(sqlite3.connect(self.path)) as conn, conn:
            conn.execute("INSERT INTO qb_matches VALUES (?,?,?)", ("1", json.dumps(state), 1))
            payload = {"match_id": state["id"], "revision": 0, "action": {"kind": "mulligan", "indices": []}}
        response = self.store.submit("1", "legacy-open-key", payload)
        self.assertEqual(response["match"]["catalog_revision"], 1)
        self.assertEqual(len(response["match_cards"]), len(LEGACY_CARDS))
        # Legacy cached responses were TEXT; modern responses are compressed BLOBs.
        with closing(sqlite3.connect(self.path)) as conn, conn:
            conn.execute("UPDATE qb_requests SET response_json=?", (json.dumps(response),))
        self.assertEqual(self.store.submit("1", "legacy-open-key", payload), response)

    def test_locked_circuit_and_no_practice_rewards(self):
        with self.assertRaises(RuleError): self.command({"kind": "start", "mode": "circuit", "opponent": "earth_guardian"})
        self.command({"kind": "start", "mode": "practice"})
        response = self.command({"kind": "resign"})
        self.assertEqual(response["profile"]["stats"]["played"], 0)
        self.assertEqual(len(response["profile"]["unlocked"]), 9)

    def test_first_win_concurrent_exact_retry_settles_once(self):
        _, payload = self.finish_fixture("chocobo_keeper")
        def submit(_): return QueensBloodStore(self.path).submit("1", "first-win-key", payload)
        with ThreadPoolExecutor(max_workers=4) as pool: responses = list(pool.map(submit, range(4)))
        self.assertTrue(all(r == responses[0] for r in responses))
        profile = responses[0]["profile"]
        self.assertEqual(profile["victories"]["chocobo_keeper"], 1)
        self.assertEqual(profile["stats"]["played"], 1)
        self.assertEqual(responses[0]["match"]["reward_cards"], ["QB005", "QB025"])
        self.assertTrue(responses[0]["opponents"][1]["unlocked"])
        with self.assertRaises(MatchConflict): self.store.submit("1", "different-win-key", payload)
        self.assertEqual(QueensBloodStore(self.path).get("1")["profile"], profile)

    def test_complete_circuit_and_rematch_rewards(self):
        for i, id in enumerate(OPPONENTS):
            _, payload = self.finish_fixture(id)
            response = self.store.submit("1", f"finish-circuit-{i}", payload)
        self.assertEqual(set(response["profile"]["unlocked"]), set(PLAYABLE))
        self.assertTrue(all(o["defeated"] and o["unlocked"] for o in response["opponents"]))
        _, payload = self.finish_fixture("chocobo_keeper")
        response = self.store.submit("1", "rematch-finish-key", payload)
        self.assertEqual(response["match"]["reward_cards"], [])
        self.assertEqual(response["profile"]["stats"]["wins"], len(OPPONENTS) + 1)
        self.assertEqual(len(response["profile"]["unlocked"]), 48)

    def test_losses_and_draws_do_not_unlock(self):
        for winner in (1, None):
            _, payload = self.finish_fixture("chocobo_keeper", winner)
            self.counter += 1
            response = self.store.submit("1", f"no-unlock-key-{self.counter}", payload)
            self.assertEqual(len(response["profile"]["unlocked"]), 9)
            self.assertFalse(response["opponents"][1]["unlocked"])
        self.assertEqual(response["profile"]["stats"], {"played": 2, "wins": 0, "losses": 1, "draws": 1})

    def test_accepted_match_keeps_promised_rewards(self):
        _, payload = self.finish_fixture("chocobo_keeper")
        with patch.dict(OPPONENTS["chocobo_keeper"], {"rewards": ["QB036"]}):
            response = self.store.submit("1", "snapshot-reward-key", payload)
        self.assertEqual(response["match"]["reward_cards"], ["QB005", "QB025"])
        self.assertNotIn("QB036", response["profile"]["unlocked"])

    def test_effect_ranges_and_magnitude(self):
        s = new_match(); s = apply_action(s, 0, {"kind": "mulligan", "indices": []})
        s["hands"][0] = ["QB005"]
        s["board"][1][2].update(card="QB003", owner=0)
        s = apply_action(s, 0, {"kind": "play", "hand": 0, "row": 1, "col": 0})
        self.assertEqual(powers(s)[1][2], 5)
        s["board"][1][0].update(card="QB020", owner=0)
        s["board"][1][1].update(card="QB003", owner=0)
        self.assertEqual(powers(s)[1][1], 4)


if __name__ == "__main__": unittest.main()
