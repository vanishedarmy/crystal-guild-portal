from __future__ import annotations

import json
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request
from pathlib import Path

from crystal_guild.hosted_portal import (
    ACTION_PROTOCOL_VERSION,
    HostedPortalHandler,
    HostedPortalHTTPServer,
    HostedPortalStore,
)
from crystal_guild.portal_auth import TwitchOAuthConfig, TwitchOAuthClient, safe_return_path

SYNC_KEY = "portal-action-test-key"
TWITCH_ID = "987654321"


def snapshot_payload(username: str = "van", twitch_id: str = TWITCH_ID) -> dict:
    return {
        "schema_version": 1,
        "sync_version": "1.1.15-wayfarer",
        "username": username,
        "player_twitch_id": twitch_id,
        "snapshot": {
            "overview": {
                "identity": {
                    "username": username,
                    "display_name": "Van",
                    "level": 12,
                    "title": "Fresh Recruit",
                    "updated_at": "2026-08-19 14:00:00",
                },
                "job": {"name": "Dragoon"},
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
    }


def has_key(value, key: str) -> bool:
    if isinstance(value, dict):
        return key in value or any(has_key(child, key) for child in value.values())
    if isinstance(value, list):
        return any(has_key(child, key) for child in value)
    return False


class PortalActionServerCase(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        root = Path(self.temp.name)
        static = root / "dist"
        static.mkdir()
        (static / "index.html").write_text("<div id='root'>Crystal Guild</div>", encoding="utf-8")
        self.store = HostedPortalStore(root / "mirror.db")
        config = TwitchOAuthConfig(
            client_id="client-id",
            client_secret="client-secret",
            redirect_uri="https://guild.example/auth/twitch/callback",
            cookie_secure=False,
        )
        self.server = HostedPortalHTTPServer(
            ("127.0.0.1", 0),
            HostedPortalHandler,
            self.store,
            static,
            SYNC_KEY,
            oauth_config=config,
            oauth_client=TwitchOAuthClient(config),
            actions_enabled=True,
        )
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f"http://127.0.0.1:{self.server.server_address[1]}"
        self.store.upsert_player(snapshot_payload())
        self.store.apply_manifest(["van"], TWITCH_ID)
        self.session_token, self.csrf = self.store.create_session(
            {"twitch_id": TWITCH_ID, "login": "van", "display_name": "Van"},
            3600,
        )

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.temp.cleanup()

    def request(self, path: str, *, method: str = "GET", payload=None, headers=None):
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        request_headers = dict(headers or {})
        if body is not None:
            request_headers.setdefault("Content-Type", "application/json")
        request = urllib.request.Request(
            self.base + path,
            data=body,
            headers=request_headers,
            method=method,
        )
        with urllib.request.urlopen(request, timeout=3) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw) if raw else {}, response.headers

    def user_headers(self, csrf: bool = False):
        result = {"Cookie": f"cg_session={self.session_token}"}
        if csrf:
            result["X-Crystal-Guild-CSRF"] = self.csrf
        return result

    def test_private_twitch_id_binds_session_but_never_leaks_from_public_player_apis(self):
        status, auth, _ = self.request("/api/auth/status", headers=self.user_headers())
        self.assertEqual(status, 200)
        self.assertTrue(auth["authenticated"])
        self.assertEqual(auth["player"]["username"], "van")
        self.assertNotIn("twitch_id", auth.get("twitch", {}))

        for path in ("/api/players", "/api/player/van"):
            status, payload, _ = self.request(path)
            self.assertEqual(status, 200)
            self.assertFalse(has_key(payload, "twitch_id"), path)
            self.assertNotIn(TWITCH_ID, json.dumps(payload), path)

    def test_unlinked_twitch_session_can_recruit_but_cannot_use_other_actions(self):
        new_id = "123456789"
        token, csrf = self.store.create_session(
            {"twitch_id": new_id, "login": "newhero", "display_name": "New Hero"}, 3600
        )
        headers = {"Cookie": f"cg_session={token}", "X-Crystal-Guild-CSRF": csrf}

        status, auth, _ = self.request("/api/auth/status", headers={"Cookie": f"cg_session={token}"})
        self.assertEqual(status, 200)
        self.assertTrue(auth["authenticated"])
        self.assertIsNone(auth["player"])
        self.assertTrue(auth["actions_enabled"])
        self.assertTrue(auth["can_recruit"])
        self.assertIn("RECRUIT", auth["action_capabilities"])

        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions", method="POST", payload={"type": "PING", "payload": {}},
                headers={**headers, "Idempotency-Key": "newhero-ping-123"},
            )
        self.assertEqual(caught.exception.code, 403)

        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions", method="POST", payload={"type": "RECRUIT", "payload": {"display_name": "spoof"}},
                headers={**headers, "Idempotency-Key": "newhero-bad-recruit"},
            )
        self.assertEqual(caught.exception.code, 400)

        status, queued, _ = self.request(
            "/api/actions", method="POST", payload={"type": "RECRUIT", "payload": {}},
            headers={**headers, "Idempotency-Key": "newhero-recruit-123"},
        )
        self.assertEqual(status, 202)
        self.assertEqual(queued["action"]["type"], "RECRUIT")
        self.assertNotIn("payload", queued["action"])

        claimed = self.store.claim_actions("bot:test", limit=1)
        self.assertEqual(len(claimed), 1)
        self.assertEqual(claimed[0]["type"], "RECRUIT")
        self.assertEqual(claimed[0]["twitch_id"], new_id)
        self.assertEqual(claimed[0]["username"], "newhero")
        self.assertEqual(claimed[0]["payload"], {"display_name": "New Hero"})

    def test_streamer_command_requires_manifest_owner_and_strict_allowlist(self):
        status, auth, _ = self.request("/api/auth/status", headers=self.user_headers())
        self.assertEqual(status, 200)
        self.assertTrue(auth["streamer_authorized"])
        self.assertIn("STREAMER_COMMAND", auth["action_capabilities"])

        status, queued, _ = self.request(
            "/api/actions", method="POST",
            payload={"type": "STREAMER_COMMAND", "payload": {"command": "health"}},
            headers={**self.user_headers(csrf=True), "Idempotency-Key": "streamer-health-001"},
        )
        self.assertEqual(status, 202)
        self.assertEqual(queued["action"]["type"], "STREAMER_COMMAND")
        claimed = self.store.claim_actions("bot:test", limit=1)
        self.assertEqual(claimed[0]["type"], "STREAMER_COMMAND")
        self.assertEqual(claimed[0]["payload"], {"command": "health"})
        self.assertTrue(self.store.complete_action(claimed[0]["id"], claimed[0]["lease_token"], True, "ok"))

        status, queued, _ = self.request(
            "/api/actions", method="POST",
            payload={"type": "STREAMER_COMMAND", "payload": {"command": "additem", "argument": "van|potion|3"}},
            headers={**self.user_headers(csrf=True), "Idempotency-Key": "streamer-additem-001"},
        )
        self.assertEqual(status, 202)
        claimed = self.store.claim_actions("bot:test", limit=1)
        self.assertEqual(claimed[0]["payload"], {"command": "additem", "argument": "van|potion|3"})
        self.assertTrue(self.store.complete_action(claimed[0]["id"], claimed[0]["lease_token"], True, "ok"))

        for bad_argument in ("van", "van|potion|0", "van|potion|1000", "|potion|1"):
            with self.assertRaises(urllib.error.HTTPError) as bad_inventory:
                self.request(
                    "/api/actions", method="POST",
                    payload={"type": "STREAMER_COMMAND", "payload": {"command": "removeitem", "argument": bad_argument}},
                    headers={**self.user_headers(csrf=True), "Idempotency-Key": f"streamer-bad-inv-{abs(hash(bad_argument))}"},
                )
            self.assertEqual(bad_inventory.exception.code, 400)

        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions", method="POST",
                payload={"type": "STREAMER_COMMAND", "payload": {"command": "say", "argument": "hello"}},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": "streamer-arbitrary-001"},
            )
        self.assertEqual(caught.exception.code, 400)

        other_id = "111222333"
        token, csrf = self.store.create_session(
            {"twitch_id": other_id, "login": "viewer", "display_name": "Viewer"}, 3600
        )
        other_headers = {"Cookie": f"cg_session={token}", "X-Crystal-Guild-CSRF": csrf}
        status, other_auth, _ = self.request("/api/auth/status", headers={"Cookie": f"cg_session={token}"})
        self.assertEqual(status, 200)
        self.assertFalse(other_auth["streamer_authorized"])
        self.assertNotIn("STREAMER_COMMAND", other_auth["action_capabilities"])
        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions", method="POST",
                payload={"type": "STREAMER_COMMAND", "payload": {"command": "health"}},
                headers={**other_headers, "Idempotency-Key": "viewer-streamer-001"},
            )
        self.assertEqual(caught.exception.code, 403)

    def test_set_title_action_is_strictly_validated_and_queued(self):
        status, auth, _ = self.request("/api/auth/status", headers=self.user_headers())
        self.assertEqual(status, 200)
        self.assertIn("SET_TITLE", auth["action_capabilities"])
        self.assertEqual(auth["action_protocol_version"], ACTION_PROTOCOL_VERSION)

        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions", method="POST",
                payload={"type": "SET_TITLE", "payload": {"title_id": "monster_botherer", "extra": True}},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": "bad-title-action-123"},
            )
        self.assertEqual(caught.exception.code, 400)

        status, queued, _ = self.request(
            "/api/actions", method="POST",
            payload={"type": "SET_TITLE", "payload": {"title_id": "monster_botherer"}},
            headers={**self.user_headers(csrf=True), "Idempotency-Key": "title-action-123"},
        )
        self.assertEqual(status, 202)
        self.assertEqual(queued["action"]["type"], "SET_TITLE")
        claimed = self.store.claim_actions("bot:test", limit=1)
        self.assertEqual(claimed[0]["payload"], {"title_id": "monster_botherer"})

    def test_ping_requires_session_and_csrf_then_claims_and_completes_with_lease(self):
        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions",
                method="POST",
                payload={"type": "PING", "payload": {}},
                headers={"Idempotency-Key": "phase1-ping-unauth"},
            )
        self.assertEqual(caught.exception.code, 401)

        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions",
                method="POST",
                payload={"type": "PING", "payload": {}},
                headers={**self.user_headers(), "Idempotency-Key": "phase1-ping-csrf"},
            )
        self.assertEqual(caught.exception.code, 403)

        status, queued, _ = self.request(
            "/api/actions",
            method="POST",
            payload={"type": "PING", "payload": {}},
            headers={**self.user_headers(csrf=True), "Idempotency-Key": "phase1-ping-success"},
        )
        self.assertEqual(status, 202)
        action_id = queued["action"]["id"]
        self.assertEqual(queued["action"]["status"], "pending")

        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request("/api/actions/claim", method="POST", payload={"worker_id": "bot:test", "protocol_version": ACTION_PROTOCOL_VERSION})
        self.assertEqual(caught.exception.code, 401)

        status, claim, _ = self.request(
            "/api/actions/claim",
            method="POST",
            payload={"worker_id": "bot:test", "limit": 8, "protocol_version": ACTION_PROTOCOL_VERSION},
            headers={"X-Crystal-Guild-Key": SYNC_KEY},
        )
        self.assertEqual(status, 200)
        self.assertEqual(claim["protocol_version"], ACTION_PROTOCOL_VERSION)
        self.assertEqual(len(claim["actions"]), 1)
        leased = claim["actions"][0]
        self.assertEqual(leased["id"], action_id)
        self.assertEqual(leased["type"], "PING")
        self.assertEqual(leased["twitch_id"], TWITCH_ID)

        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions/result",
                method="POST",
                payload={
                    "protocol_version": ACTION_PROTOCOL_VERSION,
                    "id": action_id,
                    "lease_token": "wrong-lease",
                    "ok": True,
                    "message": "nope",
                    "data": {},
                },
                headers={"X-Crystal-Guild-Key": SYNC_KEY},
            )
        self.assertEqual(caught.exception.code, 409)

        status, result, _ = self.request(
            "/api/actions/result",
            method="POST",
            payload={
                "protocol_version": ACTION_PROTOCOL_VERSION,
                "id": action_id,
                "lease_token": leased["lease_token"],
                "ok": True,
                "message": "Portal link verified for Van.",
                "data": {"username": "van", "display_name": "Van"},
            },
            headers={"X-Crystal-Guild-Key": SYNC_KEY},
        )
        self.assertEqual(status, 200)
        self.assertTrue(result["ok"])

        status, history, _ = self.request("/api/actions", headers=self.user_headers())
        self.assertEqual(status, 200)
        self.assertEqual(history["actions"][0]["status"], "completed")
        self.assertTrue(history["actions"][0]["result"]["ok"])
        self.assertNotIn("lease_token", history["actions"][0])
        self.assertNotIn("twitch_id", history["actions"][0])

    def test_idempotency_and_queue_boundaries(self):
        headers = {**self.user_headers(csrf=True), "Idempotency-Key": "same-request-123"}
        first = self.request("/api/actions", method="POST", payload={"type": "PING", "payload": {}}, headers=headers)[1]
        second = self.request("/api/actions", method="POST", payload={"type": "PING", "payload": {}}, headers=headers)[1]
        self.assertEqual(first["action"]["id"], second["action"]["id"])

        for index in range(4):
            self.request(
                "/api/actions",
                method="POST",
                payload={"type": "PING", "payload": {}},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": f"queue-bound-{index:02d}"},
            )
        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions",
                method="POST",
                payload={"type": "PING", "payload": {}},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": "queue-bound-overflow"},
            )
        self.assertEqual(caught.exception.code, 400)

    def test_phase_four_accepts_strict_character_equipment_and_shop_actions_and_rejects_arbitrary_commands(self):
        status, equip, _ = self.request(
            "/api/actions",
            method="POST",
            payload={"type": "EQUIP_ITEM", "payload": {"item_id": "bronze_sword"}},
            headers={**self.user_headers(csrf=True), "Idempotency-Key": "equip-bronze-sword"},
        )
        self.assertEqual(status, 202)
        self.assertEqual(equip["action"]["type"], "EQUIP_ITEM")

        status, unequip, _ = self.request(
            "/api/actions",
            method="POST",
            payload={"type": "UNEQUIP_SLOT", "payload": {"slot": "weapon"}},
            headers={**self.user_headers(csrf=True), "Idempotency-Key": "unequip-weapon"},
        )
        self.assertEqual(status, 202)
        self.assertEqual(unequip["action"]["type"], "UNEQUIP_SLOT")

        for claimed in self.store.claim_actions("bot:test", limit=25):
            self.assertTrue(self.store.complete_action(claimed["id"], claimed["lease_token"], True, "ok"))

        for action_type, payload, key in (
            ("CHARACTER_STATE", {}, "character-state"),
            ("CHANGE_JOB", {"job_id": "monk"}, "change-job-monk"),
            ("SET_STANCE", {"stance": "defensive"}, "stance-defensive"),
            ("SET_MASTERY", {"job_id": "warrior", "slot": 1}, "mastery-warrior-1"),
            ("CLEAR_MASTERY", {"slot": 1}, "mastery-clear-1"),
            ("SHOP_STATE", {}, "shop-state"),
            ("BUY_ITEM", {"item_id": "bronze_sword", "quantity": 1}, "buy-bronze"),
            ("SELL_ITEM", {"item_id": "potion", "quantity": 2}, "sell-potion"),
        ):
            status, response, _ = self.request(
                "/api/actions",
                method="POST",
                payload={"type": action_type, "payload": payload},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": key},
            )
            self.assertEqual(status, 202)
            self.assertEqual(response["action"]["type"], action_type)
            claimed = self.store.claim_actions("bot:test", limit=1)
            self.assertEqual(len(claimed), 1)
            self.assertTrue(self.store.complete_action(claimed[0]["id"], claimed[0]["lease_token"], True, "ok"))

        invalid = [
            ("EQUIP_ITEM", {}),
            ("EQUIP_ITEM", {"item_id": "bronze_sword", "command": "!readyall"}),
            ("UNEQUIP_SLOT", {"slot": "ring"}),
            ("CHARACTER_STATE", {"unexpected": True}),
            ("CHANGE_JOB", {}),
            ("CHANGE_JOB", {"job_id": "warrior", "command": "!readyall"}),
            ("SET_STANCE", {"stance": "berserk"}),
            ("SET_MASTERY", {"job_id": "warrior", "slot": 3}),
            ("CLEAR_MASTERY", {"slot": 0}),
            ("SHOP_STATE", {"unexpected": True}),
            ("BUY_ITEM", {}),
            ("BUY_ITEM", {"item_id": "bronze_sword", "quantity": 0}),
            ("BUY_ITEM", {"item_id": "bronze_sword", "quantity": 1, "command": "!readyall"}),
            ("SELL_ITEM", {"item_id": "potion", "quantity": 100}),
            ("COMMAND", {"text": "!readyall"}),
            ("READYALL", {}),
        ]
        for index, (action_type, payload) in enumerate(invalid):
            with self.assertRaises(urllib.error.HTTPError) as caught:
                self.request(
                    "/api/actions",
                    method="POST",
                    payload={"type": action_type, "payload": payload},
                    headers={**self.user_headers(csrf=True), "Idempotency-Key": f"reject-action-{index:02d}"},
                )
            self.assertEqual(caught.exception.code, 400)


    def test_phase_five_accepts_only_structured_recovery_actions(self):
        for action_type, payload, key in (
            ("RECOVERY_STATE", {}, "recovery-state"),
            ("USE_FIELD_ITEM", {"item_id": "potion"}, "use-potion"),
            ("START_REST", {}, "start-rest"),
        ):
            status, response, _ = self.request(
                "/api/actions",
                method="POST",
                payload={"type": action_type, "payload": payload},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": key},
            )
            self.assertEqual(status, 202)
            self.assertEqual(response["action"]["type"], action_type)
            claimed = self.store.claim_actions("bot:test", limit=1)
            self.assertEqual(len(claimed), 1)
            self.assertTrue(self.store.complete_action(claimed[0]["id"], claimed[0]["lease_token"], True, "ok"))

        for index, (action_type, payload) in enumerate((
            ("RECOVERY_STATE", {"unexpected": True}),
            ("USE_FIELD_ITEM", {}),
            ("USE_FIELD_ITEM", {"item_id": "potion", "command": "!readyall"}),
            ("START_REST", {"seconds": 1}),
        )):
            with self.assertRaises(urllib.error.HTTPError) as caught:
                self.request(
                    "/api/actions",
                    method="POST",
                    payload={"type": action_type, "payload": payload},
                    headers={**self.user_headers(csrf=True), "Idempotency-Key": f"reject-recovery-{index:02d}"},
                )
            self.assertEqual(caught.exception.code, 400)

    def test_phase_six_accepts_only_typed_fellowship_contribution_actions(self):
        for action_type, payload, key in (
            ("FELLOWSHIP_STATE", {}, "fellowship-state"),
            ("CONTRIBUTE_GIL", {"amount": 5000}, "fellowship-gil"),
            ("CONTRIBUTE_ITEM", {"item_id": "hi_potion", "quantity": 3}, "fellowship-item"),
            ("WORKSHOP_EXCHANGE", {"exchange_id": "refine_mythril", "batches": 2}, "workshop-exchange"),
        ):
            status, response, _ = self.request(
                "/api/actions",
                method="POST",
                payload={"type": action_type, "payload": payload},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": key},
            )
            self.assertEqual(status, 202)
            self.assertEqual(response["action"]["type"], action_type)
            claimed = self.store.claim_actions("bot:test", limit=1)
            self.assertEqual(len(claimed), 1)
            self.assertTrue(self.store.complete_action(claimed[0]["id"], claimed[0]["lease_token"], True, "ok"))

        invalid = (
            ("FELLOWSHIP_STATE", {"unexpected": True}),
            ("CONTRIBUTE_GIL", {}),
            ("CONTRIBUTE_GIL", {"amount": 0}),
            ("CONTRIBUTE_GIL", {"amount": 1000001}),
            ("CONTRIBUTE_GIL", {"amount": 100, "command": "!readyall"}),
            ("CONTRIBUTE_ITEM", {"item_id": "hi_potion", "quantity": 0}),
            ("CONTRIBUTE_ITEM", {"item_id": "hi potion", "quantity": 1}),
            ("CONTRIBUTE_ITEM", {"item_id": "hi_potion", "quantity": 1000}),
            ("CONTRIBUTE_ITEM", {"item_id": "hi_potion", "quantity": 1, "command": "!readyall"}),
            ("WORKSHOP_EXCHANGE", {"exchange_id": "refine mythril", "batches": 1}),
            ("WORKSHOP_EXCHANGE", {"exchange_id": "refine_mythril", "batches": 0}),
            ("WORKSHOP_EXCHANGE", {"exchange_id": "refine_mythril", "batches": 21}),
            ("WORKSHOP_EXCHANGE", {"exchange_id": "refine_mythril", "batches": 1, "command": "!readyall"}),
        )
        for index, (action_type, payload) in enumerate(invalid):
            with self.assertRaises(urllib.error.HTTPError) as caught:
                self.request(
                    "/api/actions",
                    method="POST",
                    payload={"type": action_type, "payload": payload},
                    headers={**self.user_headers(csrf=True), "Idempotency-Key": f"reject-fellowship-{index:02d}"},
                )
            self.assertEqual(caught.exception.code, 400)

    def test_phase_seven_accepts_only_typed_blacksmith_and_daily_actions(self):
        for action_type, payload, key in (
            ("CRAFTING_STATE", {}, "crafting-state"),
            ("CRAFT_RECIPE", {"recipe_id": "hi_potion_batch", "quantity": 2}, "craft-recipe"),
            ("FORGE_ITEM", {"item_id": "hunters_axe"}, "forge-item"),
            ("DAILY_STATE", {}, "daily-state"),
            ("CLAIM_DAILY", {}, "claim-daily"),
        ):
            status, response, _ = self.request(
                "/api/actions",
                method="POST",
                payload={"type": action_type, "payload": payload},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": key},
            )
            self.assertEqual(status, 202)
            self.assertEqual(response["action"]["type"], action_type)
            claimed = self.store.claim_actions("bot:test", limit=1)
            self.assertEqual(len(claimed), 1)
            self.assertTrue(self.store.complete_action(claimed[0]["id"], claimed[0]["lease_token"], True, "ok"))

        invalid = (
            ("CRAFTING_STATE", {"unexpected": True}),
            ("CRAFT_RECIPE", {"recipe_id": "hi_potion_batch", "quantity": 0}),
            ("CRAFT_RECIPE", {"recipe_id": "hi potion batch", "quantity": 1}),
            ("CRAFT_RECIPE", {"recipe_id": "hi_potion_batch", "quantity": 21}),
            ("CRAFT_RECIPE", {"recipe_id": "hi_potion_batch", "quantity": 1, "command": "!readyall"}),
            ("FORGE_ITEM", {}),
            ("FORGE_ITEM", {"item_id": "hunter axe"}),
            ("FORGE_ITEM", {"item_id": "hunters_axe", "quantity": 1}),
            ("DAILY_STATE", {"force": True}),
            ("CLAIM_DAILY", {"command": "!daily"}),
        )
        for index, (action_type, payload) in enumerate(invalid):
            with self.assertRaises(urllib.error.HTTPError) as caught:
                self.request(
                    "/api/actions",
                    method="POST",
                    payload={"type": action_type, "payload": payload},
                    headers={**self.user_headers(csrf=True), "Idempotency-Key": f"reject-phase7-{index:02d}"},
                )
            self.assertEqual(caught.exception.code, 400)

    def test_chocobo_companions_accept_only_typed_stable_actions(self):
        for action_type, payload, key in (
            ("CHOCOBO_STATE", {}, "chocobo-state"),
            ("COMPLETE_CHOCOBO_QUEST", {}, "chocobo-quest"),
            ("PURCHASE_CHOCOBO_WRIT", {}, "chocobo-writ"),
            ("REGISTER_CHOCOBO", {"name": "Biscuit"}, "chocobo-register"),
            ("RENAME_CHOCOBO", {"name": "Drumstick"}, "chocobo-rename"),
            ("SET_CHOCOBO_PORTRAIT", {"portrait_id": "arcane_violet"}, "chocobo-portrait"),
        ):
            status, response, _ = self.request(
                "/api/actions", method="POST",
                payload={"type": action_type, "payload": payload},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": key},
            )
            self.assertEqual(status, 202)
            self.assertEqual(response["action"]["type"], action_type)
            claimed = self.store.claim_actions("bot:test", limit=1)
            self.assertEqual(len(claimed), 1)
            self.assertTrue(self.store.complete_action(claimed[0]["id"], claimed[0]["lease_token"], True, "ok"))

        invalid = (
            ("CHOCOBO_STATE", {"force": True}),
            ("COMPLETE_CHOCOBO_QUEST", {"quest_id": "a_chocobo_of_your_own"}),
            ("PURCHASE_CHOCOBO_WRIT", {"quantity": 2}),
            ("REGISTER_CHOCOBO", {}),
            ("REGISTER_CHOCOBO", {"name": "!"}),
            ("REGISTER_CHOCOBO", {"name": "Biscuit", "command": "!readyall"}),
            ("RENAME_CHOCOBO", {"name": "x"}),
            ("RENAME_CHOCOBO", {"name": "Bird/One"}),
            ("SET_CHOCOBO_PORTRAIT", {}),
            ("SET_CHOCOBO_PORTRAIT", {"portrait_id": "Arcane Violet"}),
            ("SET_CHOCOBO_PORTRAIT", {"portrait_id": "not_real"}),
            ("SET_CHOCOBO_PORTRAIT", {"portrait_id": "arcane_violet", "command": "!readyall"}),
        )
        for index, (action_type, payload) in enumerate(invalid):
            with self.assertRaises(urllib.error.HTTPError) as caught:
                self.request(
                    "/api/actions", method="POST",
                    payload={"type": action_type, "payload": payload},
                    headers={**self.user_headers(csrf=True), "Idempotency-Key": f"reject-chocobo-{index:02d}"},
                )
            self.assertEqual(caught.exception.code, 400)

    def test_wayfarer_accepts_only_typed_portal_side_adventure_actions(self):
        for action_type, payload, key in (
            ("ADVENTURE_STATE", {}, "adventure-state"),
            ("TRAVEL_REGION", {"region_id": "sable_coast"}, "travel-sable"),
            ("SOLO_VENTURE", {}, "solo-venture-now"),
            ("SOLO_EXPEDITION_ACTION", {"action": "attack"}, "solo-action-attack"),
            ("SOLO_EXPEDITION_CONTINUE", {}, "solo-continue"),
            ("SOLO_EXPEDITION_RETURN", {}, "solo-return"),
            ("SOLO_EXPEDITION_RETREAT", {}, "solo-retreat"),
            ("CHALLENGE_HUNT", {"hunt_id": "red_hot_problem"}, "hunt-red-hot"),
            ("ACK_ADVENTURE_RESULT", {"result_id": 42}, "ack-adventure-result"),
            ("EXPEDITION_START", {"region_id": "emerald_wilds", "depth": "scout"}, "expedition-start"),
            ("EXPEDITION_START", {"region_id": "emerald_wilds", "depth": "boss"}, "expedition-boss"),
            ("EXPEDITION_START", {"region_id": "emerald_wilds", "depth": "legendary"}, "expedition-legendary"),
            ("EXPEDITION_RESOLVE_STAGE", {}, "expedition-resolve"),
            ("EXPEDITION_ACTION", {"action": "attack"}, "expedition-attack"),
            ("EXPEDITION_CONTINUE", {"route": "deep"}, "expedition-continue"),
            ("EXPEDITION_CAMP", {}, "expedition-camp"),
            ("EXPEDITION_RETURN", {}, "expedition-return"),
            ("EXPEDITION_RETREAT", {}, "expedition-retreat"),
        ):
            status, response, _ = self.request(
                "/api/actions",
                method="POST",
                payload={"type": action_type, "payload": payload},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": key},
            )
            self.assertEqual(status, 202)
            self.assertEqual(response["action"]["type"], action_type)
            claimed = self.store.claim_actions("bot:test", limit=1)
            self.assertEqual(len(claimed), 1)
            self.assertTrue(self.store.complete_action(claimed[0]["id"], claimed[0]["lease_token"], True, "ok"))

        invalid = (
            ("ADVENTURE_STATE", {"unexpected": True}),
            ("TRAVEL_REGION", {}),
            ("TRAVEL_REGION", {"region_id": "Sable Coast"}),
            ("TRAVEL_REGION", {"region_id": "sable_coast", "command": "!travel"}),
            ("VENTURE", {}),
            ("VENTURE", {"bypass_cooldown": True}),
            ("SOLO_VENTURE", {"bypass_cooldown": True}),
            ("SOLO_EXPEDITION_ACTION", {}),
            ("SOLO_EXPEDITION_ACTION", {"action": "!attack"}),
            ("SOLO_EXPEDITION_ACTION", {"action": "attack", "target": "monster"}),
            ("SOLO_EXPEDITION_CONTINUE", {"force": True}),
            ("SOLO_EXPEDITION_RETURN", {"force": True}),
            ("SOLO_EXPEDITION_RETREAT", {"force": True}),
            ("JOIN_ENCOUNTER", {}),
            ("JOIN_ENCOUNTER", {"encounter_id": 1}),
            ("CHALLENGE_HUNT", {}),
            ("CHALLENGE_HUNT", {"hunt_id": "Red Hot Problem"}),
            ("CHALLENGE_HUNT", {"hunt_id": "red_hot_problem", "command": "!hunt"}),
            ("ACK_ADVENTURE_RESULT", {}),
            ("ACK_ADVENTURE_RESULT", {"result_id": 0}),
            ("ACK_ADVENTURE_RESULT", {"result_id": "result-one"}),
            ("ACK_ADVENTURE_RESULT", {"result_id": 1, "command": "!clear"}),
            ("EXPEDITION_START", {}),
            ("EXPEDITION_START", {"region_id": "Emerald Wilds", "depth": "scout"}),
            ("EXPEDITION_START", {"region_id": "emerald_wilds", "depth": "extreme"}),
            ("EXPEDITION_RESOLVE_STAGE", {"force": True}),
            ("EXPEDITION_ACTION", {}),
            ("EXPEDITION_ACTION", {"action": "!attack"}),
            ("EXPEDITION_CONTINUE", {"route": "reckless"}),
            ("EXPEDITION_CAMP", {"duration": 1}),
            ("EXPEDITION_RETURN", {"force": True}),
            ("EXPEDITION_RETREAT", {"force": True}),
            ("ATTACK", {}),
            ("ABILITY", {"name": "Provoke"}),
            ("RAID", {}),
        )
        for index, (action_type, payload) in enumerate(invalid):
            with self.assertRaises(urllib.error.HTTPError) as caught:
                self.request(
                    "/api/actions", method="POST",
                    payload={"type": action_type, "payload": payload},
                    headers={**self.user_headers(csrf=True), "Idempotency-Key": f"reject-wayfarer-{index:02d}"},
                )
            self.assertEqual(caught.exception.code, 400)

    def test_hotfix2_coalesces_daily_and_adventure_refreshes_across_browser_retry_keys(self):
        ids = {}
        for action_type in ("ADVENTURE_STATE", "DAILY_STATE"):
            seen = []
            for index in range(4):
                status, response, _ = self.request(
                    "/api/actions",
                    method="POST",
                    payload={"type": action_type, "payload": {}},
                    headers={**self.user_headers(csrf=True), "Idempotency-Key": f"h2-{action_type.lower()}-{index:02d}"},
                )
                self.assertEqual(status, 202)
                seen.append(response["action"]["id"])
            self.assertEqual(len(set(seen)), 1, action_type)
            ids[action_type] = seen[0]

        queued = self.store.list_actions(TWITCH_ID, limit=20)
        pending = [row for row in queued if row["status"] in {"pending", "processing"}]
        self.assertEqual({row["id"] for row in pending}, set(ids.values()))

    def test_hotfix2_state_refreshes_do_not_starve_solo_gameplay_actions(self):
        for index, action_type in enumerate((
            "CHARACTER_STATE", "SHOP_STATE", "RECOVERY_STATE", "FELLOWSHIP_STATE", "ADVENTURE_STATE",
        )):
            status, _, _ = self.request(
                "/api/actions",
                method="POST",
                payload={"type": action_type, "payload": {}},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": f"h2-state-backlog-{index:02d}"},
            )
            self.assertEqual(status, 202)

        status, response, _ = self.request(
            "/api/actions",
            method="POST",
            payload={"type": "SOLO_EXPEDITION_ACTION", "payload": {"action": "attack"}},
            headers={**self.user_headers(csrf=True), "Idempotency-Key": "h2-solo-priority-attack"},
        )
        self.assertEqual(status, 202)
        solo_id = response["action"]["id"]
        claimed = self.store.claim_actions("bot:h2-priority", limit=1)
        self.assertEqual(len(claimed), 1)
        self.assertEqual(claimed[0]["id"], solo_id)
        self.assertEqual(claimed[0]["type"], "SOLO_EXPEDITION_ACTION")

    def test_hotfix3_large_adventure_state_result_can_complete(self):
        status, queued, _ = self.request(
            "/api/actions",
            method="POST",
            payload={"type": "ADVENTURE_STATE", "payload": {}},
            headers={**self.user_headers(csrf=True), "Idempotency-Key": "h3-large-adventure-state"},
        )
        self.assertEqual(status, 202)
        claimed = self.store.claim_actions("bot:h3-large-state", limit=1)
        self.assertEqual(len(claimed), 1)
        self.assertEqual(claimed[0]["type"], "ADVENTURE_STATE")
        # Arsenal's expanded Hunt/ability data plus a stocked Solo Venture can
        # legitimately exceed the old 16 KiB request-payload ceiling. Result
        # envelopes use their own larger bound so the Bot can complete them.
        large_board = {"adventure_state": {"solo_venture": {"expedition": {"combat": {"items": [
            {"id": f"item-{index}", "name": "Emergency Supply", "description": "x" * 700}
            for index in range(30)
        ]}}}}}
        self.assertGreater(len(json.dumps(large_board).encode("utf-8")), 16 * 1024)
        self.assertTrue(self.store.complete_action(
            claimed[0]["id"], claimed[0]["lease_token"], True, "Adventure Board refreshed.", large_board
        ))
        rows = self.store.list_actions(TWITCH_ID, limit=5)
        row = next(item for item in rows if item["id"] == claimed[0]["id"])
        self.assertEqual(row["status"], "completed")

    def test_hotfix5_http_result_endpoint_accepts_large_authoritative_result(self):
        status, queued, _ = self.request(
            "/api/actions",
            method="POST",
            payload={"type": "ADVENTURE_STATE", "payload": {}},
            headers={**self.user_headers(csrf=True), "Idempotency-Key": "h5-http-large-adventure-state"},
        )
        self.assertEqual(status, 202)

        status, claim, _ = self.request(
            "/api/actions/claim",
            method="POST",
            payload={"worker_id": "bot:h5-http", "limit": 1, "protocol_version": ACTION_PROTOCOL_VERSION},
            headers={"X-Crystal-Guild-Key": SYNC_KEY},
        )
        self.assertEqual(status, 200)
        self.assertEqual(len(claim["actions"]), 1)
        action = claim["actions"][0]

        large_board = {"adventure_state": {"solo_venture": {"expedition": {"combat": {"items": [
            {"id": f"item-{index}", "name": "Emergency Supply", "description": "x" * 700}
            for index in range(30)
        ]}}}}}
        result_payload = {
            "protocol_version": ACTION_PROTOCOL_VERSION,
            "id": action["id"],
            "lease_token": action["lease_token"],
            "ok": True,
            "message": "Adventure Board refreshed.",
            "data": large_board,
        }
        encoded = json.dumps(result_payload).encode("utf-8")
        self.assertGreater(len(encoded), 16 * 1024)
        self.assertLess(len(encoded), 64 * 1024)

        status, completed, _ = self.request(
            "/api/actions/result",
            method="POST",
            payload=result_payload,
            headers={"X-Crystal-Guild-Key": SYNC_KEY},
        )
        self.assertEqual(status, 200)
        self.assertTrue(completed["ok"])
        rows = self.store.list_actions(TWITCH_ID, limit=5)
        row = next(item for item in rows if item["id"] == queued["action"]["id"])
        self.assertEqual(row["status"], "completed")

    def test_hotfix3_result_limit_remains_bounded(self):
        status, queued, _ = self.request(
            "/api/actions",
            method="POST",
            payload={"type": "PING", "payload": {}},
            headers={**self.user_headers(csrf=True), "Idempotency-Key": "h3-result-bound"},
        )
        self.assertEqual(status, 202)
        claimed = self.store.claim_actions("bot:h3-bound", limit=1)
        with self.assertRaises(ValueError):
            self.store.complete_action(
                claimed[0]["id"], claimed[0]["lease_token"], True, "oversized", {"blob": "x" * (70 * 1024)}
            )

    def test_hotfix2_duplicate_solo_round_retry_reuses_inflight_action(self):
        seen = []
        for key in ("h2-solo-retry-one", "h2-solo-retry-two"):
            status, response, _ = self.request(
                "/api/actions",
                method="POST",
                payload={"type": "SOLO_EXPEDITION_ACTION", "payload": {"action": "ability:fire"}},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": key},
            )
            self.assertEqual(status, 202)
            seen.append(response["action"]["id"])
        self.assertEqual(seen[0], seen[1])
        claimed = self.store.claim_actions("bot:h2-retry", limit=8)
        solo = [row for row in claimed if row["type"] == "SOLO_EXPEDITION_ACTION"]
        self.assertEqual(len(solo), 1)
        self.assertEqual(solo[0]["id"], seen[0])

    def test_claim_rejects_old_action_protocol_workers(self):
        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions/claim",
                method="POST",
                payload={"worker_id": "bot:old", "limit": 8, "protocol_version": ACTION_PROTOCOL_VERSION - 1},
                headers={"X-Crystal-Guild-Key": SYNC_KEY},
            )
        self.assertEqual(caught.exception.code, 400)

    def test_actions_disable_when_bot_sync_is_stale(self):
        self.store._last_sync = int(time.time()) - 600
        with self.assertRaises(urllib.error.HTTPError) as caught:
            self.request(
                "/api/actions",
                method="POST",
                payload={"type": "PING", "payload": {}},
                headers={**self.user_headers(csrf=True), "Idempotency-Key": "offline-ping-123"},
            )
        self.assertEqual(caught.exception.code, 503)

    def test_unlinked_recruit_status_disables_when_bot_sync_is_stale(self):
        token, _ = self.store.create_session(
            {"twitch_id": "555555555", "login": "offlinehero", "display_name": "Offline Hero"}, 3600
        )
        self.store._last_sync = int(time.time()) - 600
        status, auth, _ = self.request(
            "/api/auth/status", headers={"Cookie": f"cg_session={token}"}
        )
        self.assertEqual(status, 200)
        self.assertTrue(auth["authenticated"])
        self.assertIsNone(auth["player"])
        self.assertFalse(auth["sync_connected"])
        self.assertFalse(auth["actions_enabled"])
        self.assertFalse(auth["can_recruit"])


class PortalAuthHelpersTests(unittest.TestCase):
    def test_safe_return_path_stays_same_origin(self):
        self.assertEqual(safe_return_path("/player/van"), "/player/van")
        for unsafe in ("https://evil.example", "//evil.example", "/api/actions", "/auth/twitch", "\\evil"):
            self.assertEqual(safe_return_path(unsafe), "/players")

    def test_authorization_url_uses_server_side_code_flow_fields(self):
        config = TwitchOAuthConfig("cid", "secret", "https://guild.example/auth/twitch/callback")
        url = TwitchOAuthClient(config).authorization_url("state123")
        self.assertIn("https://id.twitch.tv/oauth2/authorize?", url)
        self.assertIn("client_id=cid", url)
        self.assertIn("response_type=code", url)
        self.assertIn("state=state123", url)
        self.assertIn("scope=openid", url)
        self.assertIn("redirect_uri=", url)


if __name__ == "__main__":
    unittest.main()
