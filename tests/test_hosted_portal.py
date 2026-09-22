from __future__ import annotations

import gzip
import json
import tempfile
import time
import threading
import unittest
from unittest.mock import patch
import urllib.error
import urllib.request
from pathlib import Path

from crystal_guild.hosted_portal import HostedPortalHandler, HostedPortalHTTPServer, HostedPortalStore


SYNC_KEY = "test-sync-key"


def snapshot_payload(username: str = "van") -> dict:
    modules = {
        "overview": {
            "identity": {
                "username": username,
                "display_name": "Van",
                "level": 12,
                "title": "Fresh Recruit",
                "updated_at": "2026-08-14 12:00:00",
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
    }
    return {"schema_version": 1, "username": username, "snapshot": modules}


class PortalServerCase(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        root = Path(self.temp.name)
        static = root / "dist"
        static.mkdir()
        (static / "index.html").write_text("<div id='root'>Tonberry Rebuild</div>", encoding="utf-8")
        (static / "guide-data.json").write_text("{\"meta\":{\"version\":\"v1.1.15 — Wayfarer\"}}", encoding="utf-8")
        (static / "guide.css").write_text(".guide{}", encoding="utf-8")
        (static / "raid-overlay.html").write_text("<title>Crystal Guild Raid Overlay</title>", encoding="utf-8")
        (static / "art.webp").write_bytes(b"RIFF" + (b"x" * 4096))
        store = HostedPortalStore(root / "mirror.db")
        self.store = store
        self.server = HostedPortalHTTPServer(("127.0.0.1", 0), HostedPortalHandler, store, static, SYNC_KEY)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f"http://127.0.0.1:{self.server.server_address[1]}"

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.temp.cleanup()

    def get(self, path):
        with urllib.request.urlopen(self.base + path, timeout=3) as response:
            return response.status, response.read().decode("utf-8"), response.headers

    def post(self, path, payload, key=SYNC_KEY):
        request = urllib.request.Request(
            self.base + path,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "X-Crystal-Guild-Key": key},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=3) as response:
            return response.status, json.loads(response.read().decode("utf-8"))

    def test_guide_assets_are_revalidated(self):
        for path in ("/guide-data.json", "/guide.css"):
            status, _, headers = self.get(path)
            self.assertEqual(status, 200)
            self.assertEqual(headers.get("Cache-Control"), "no-cache")

    def test_binary_artwork_streams_without_process_cache_growth(self):
        request = urllib.request.Request(self.base + "/art.webp")
        with urllib.request.urlopen(request, timeout=3) as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(response.headers.get("Content-Type"), "image/webp")
            self.assertTrue(response.headers.get("ETag"))
            self.assertEqual(len(response.read()), 4100)
        self.assertFalse(any(path.name == "art.webp" for path in self.server.static_cache))

    def test_static_etag_returns_not_modified_without_body(self):
        status, _, headers = self.get("/index.html")
        self.assertEqual(status, 200)
        etag = headers.get("ETag")
        self.assertTrue(etag)
        request = urllib.request.Request(self.base + "/index.html", headers={"If-None-Match": etag})
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request, timeout=3)
        self.assertEqual(caught.exception.code, 304)
        self.assertEqual(caught.exception.headers.get("ETag"), etag)
        self.assertEqual(caught.exception.headers.get("Cache-Control"), "no-cache")


    def test_dynamic_json_etag_returns_not_modified_without_body(self):
        status, _, headers = self.get("/api/players")
        self.assertEqual(status, 200)
        etag = headers.get("ETag")
        self.assertTrue(etag)
        request = urllib.request.Request(self.base + "/api/players", headers={"If-None-Match": etag})
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request, timeout=3)
        self.assertEqual(caught.exception.code, 304)
        self.assertEqual(caught.exception.headers.get("ETag"), etag)
        self.assertEqual(caught.exception.headers.get("Content-Length"), "0")
        self.assertEqual(caught.exception.read(), b"")

    def test_manifest_reports_only_missing_shared_snapshots_for_recovery(self):
        manifest = {"schema_version": 1, "sync_version": "http-efficiency-test", "usernames": []}
        status, result = self.post("/api/sync/manifest", manifest)
        self.assertEqual(status, 200)
        self.assertTrue(result["needs_fellowship"])
        self.assertTrue(result["needs_overlay"])
        fellowship = {
            "schema_version": 1, "sync_version": "http-efficiency-test",
            "fellowship": {
                "level": 1, "level_label": "LVL 1", "renown": 0,
                "level_progress": {"level": 1, "current": 0, "start": 0, "next": 1000, "maxed": False},
                "member_count": 0, "active_project": None, "available_projects": [],
                "facilities": [], "orders": {"period": "2026-W37", "orders": [], "completed": 0, "total": 0},
                "deeds": [], "deeds_complete": 0, "leaders": [], "recent_activity": [],
                "totals": {"gil_donated": 0, "materials_donated": 0},
                "expedition_board_complete": False, "rank_ladder": [], "effects": {},
            },
        }
        overlay = {
            "schema_version": 1, "sync_version": "http-efficiency-test",
            "overlay": {
                "active": False, "status": "IDLE", "boss": "", "tier": "",
                "encounter_type": "", "encounter_name": "", "hp": 0, "max_hp": 0,
                "round": 0, "phase": "", "signature": "", "raiders": 0, "alive": 0,
                "ready_actions": 0, "actionable_raiders": 0, "enraged": False,
                "summon_gauge": 0, "top": [], "adds": [], "mechanic": None,
                "last_mechanic": None, "next_round_at": 0, "updated_at": int(time.time()),
            },
        }
        self.assertEqual(self.post("/api/sync/fellowship", fellowship)[0], 200)
        self.assertEqual(self.post("/api/sync/overlay", overlay)[0], 200)
        status, result = self.post("/api/sync/manifest", manifest)
        self.assertEqual(status, 200)
        self.assertFalse(result["needs_fellowship"])
        self.assertFalse(result["needs_overlay"])

    def test_streamer_dashboard_is_public_read_only_aggregate(self):
        payload = snapshot_payload("van")
        overview = payload["snapshot"]["overview"]
        overview["hp"] = {"current": 321, "max": 400}
        overview["region"] = {"name": "Mist Continent"}
        overview["counts"] = {
            "achievements": 9, "mastered_jobs": 2, "boss_clears": 4,
            "hunts": 3, "relics": 1, "bestiary": 22,
        }
        overview["job"]["level"] = 18
        overview["identity"]["gil"] = 1234
        overview["identity"]["hunt_seals"] = 44
        overview["recent_activity"] = [{
            "kind": "gil", "asset": "gil", "amount": 250,
            "source": "monster:iron_giant", "created_at": "2026-08-14 12:01:00",
        }]
        status, _ = self.post("/api/sync/player", payload)
        self.assertEqual(status, 200)

        status, body, _ = self.get("/api/streamer")
        data = json.loads(body)
        self.assertEqual(status, 200)
        self.assertEqual(data["summary"]["total"], 1)
        self.assertEqual(data["summary"]["ready"], 1)
        self.assertEqual(data["players"][0]["hp_current"], 321)
        self.assertEqual(data["players"][0]["boss_clears"], 4)
        self.assertEqual(data["leaders"]["boss_clears"]["display_name"], "Van")
        self.assertEqual(data["activity"][0]["display_name"], "Van")
        self.assertNotIn("snapshot", data["players"][0])

    def test_fellowship_sync_and_public_api(self):
        payload = {
            "schema_version": 1,
            "sync_version": "1.1.15-wayfarer",
            "fellowship": {
                "level": 2, "level_label": "LVL 2", "renown": 1250,
                "level_progress": {"level": 2, "current": 1250, "start": 1000, "next": 2500, "maxed": False},
                "member_count": 4, "active_project": None, "available_projects": [],
                "facilities": [], "orders": {"period": "2026-W34", "orders": [], "completed": 0, "total": 0},
                "deeds": [], "deeds_complete": 0, "leaders": [], "recent_activity": [],
                "totals": {"gil_donated": 5000, "materials_donated": 10},
                "expedition_board_complete": False, "rank_ladder": [], "effects": {},
            },
        }
        status, result = self.post("/api/sync/fellowship", payload)
        self.assertEqual(status, 200)
        self.assertTrue(result["ok"])
        status, body, _ = self.get("/api/fellowship")
        fellowship = json.loads(body)
        self.assertEqual(status, 200)
        self.assertEqual(fellowship["level_label"], "LVL 2")
        self.assertEqual(fellowship["member_count"], 4)


    def test_hosted_overlay_sync_public_api_and_obs_route(self):
        payload = {
            "schema_version": 1,
            "sync_version": "1.1.15-wayfarer",
            "overlay": {
                "active": True, "status": "COMBAT", "boss": "Behemoth King",
                "tier": "Trial", "encounter_type": "Trial", "encounter_name": "Inferno Crucible",
                "hp": 1500, "max_hp": 2500, "round": 3, "phase": "Rage",
                "signature": "Hellfire", "raiders": 4, "alive": 3, "ready_actions": 2, "actionable_raiders": 3, "enraged": False,
                "summon_gauge": 45,
                "top": [{"name": "Van", "role": "Tank", "damage": 900, "healing": 25, "mitigation": 70, "score": 968}],
                "adds": [{"name": "Icebound Mirror A", "hp": 500, "max_hp": 1200}],
                "mechanic": {"name": "Diamond Aegis", "kind": "break_check", "warning": "Break the aegis!", "rounds_remaining": 1, "required": 1200, "progress": 700},
                "last_mechanic": {"name": "Radiant Plume", "kind": "raidwide", "result": "resolved"},
                "next_round_at": 1770000015, "updated_at": 1770000000,
            },
        }
        status, result = self.post("/api/sync/overlay", payload)
        self.assertEqual(status, 200)
        self.assertTrue(result["ok"])
        status, body, _ = self.get("/api/overlay/state")
        state = json.loads(body)
        self.assertEqual(status, 200)
        self.assertTrue(state["available"])
        self.assertEqual(state["boss"], "Behemoth King")
        self.assertEqual(state["encounter_type"], "Trial")
        self.assertEqual(state["top"][0]["damage"], 900)
        self.assertEqual(state["top"][0]["mitigation"], 70)
        self.assertEqual(state["top"][0]["score"], 968)
        self.assertEqual(state["top"][0]["role"], "Tank")
        self.assertEqual(state["ready_actions"], 2)
        self.assertEqual(state["actionable_raiders"], 3)
        self.assertEqual(state["adds"][0]["name"], "Icebound Mirror A")
        self.assertEqual(state["mechanic"]["name"], "Diamond Aegis")
        self.assertEqual(state["last_mechanic"]["name"], "Radiant Plume")
        status, body, _ = self.get("/overlay")
        self.assertEqual(status, 200)
        self.assertIn("Crystal Guild Raid Overlay", body)

    def test_streamer_route_serves_react_shell(self):
        status, body, _ = self.get("/streamer")
        self.assertEqual(status, 200)
        self.assertIn("Tonberry Rebuild", body)

    def test_health(self):
        status, body, _ = self.get("/api/health")
        payload = json.loads(body)
        self.assertEqual(status, 200)
        self.assertTrue(payload["ok"])
        self.assertIn("1.9.0-hall-of-trophies-alpha7", payload["version"])
        self.assertEqual(payload["frontend_asset_revision"], "1.9.0-hall-of-trophies-alpha7")
        self.assertEqual(payload["database"], "ok")
        self.assertIn("sync_age_seconds", payload)
        self.assertIn("sync_connected", payload)
        self.assertIn("sync_stale_after_seconds", payload)

    def test_event_stream_starts_with_retry_and_ready(self):
        with urllib.request.urlopen(self.base + "/api/events", timeout=3) as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(response.headers.get_content_type(), "text/event-stream")
            lines = [response.readline().decode("utf-8").strip() for _ in range(5)]
        joined = "\n".join(lines)
        self.assertIn("retry: 2000", joined)
        self.assertIn("event: ready", joined)
        self.assertIn("revision", joined)

    def test_spa_routes_serve_react_index(self):
        for path in ("/", "/players", "/fellowship", "/fellowship/", "/player/van", "/guide", "/guide/jobs", "/privacy", "/privacy/"):
            status, body, _ = self.get(path)
            self.assertEqual(status, 200, path)
            self.assertIn("Tonberry Rebuild", body, path)

    def test_manifest_heartbeat_updates_health_freshness(self):
        before = self.store.health()["last_sync"]
        status, result = self.post("/api/sync/manifest", {
            "schema_version": 1, "sync_version": "0.9.0-beta-active-battle", "usernames": [],
        })
        self.assertEqual(status, 200)
        self.assertTrue(result["ok"])
        self.assertGreaterEqual(self.store.health()["last_sync"], before)
        self.assertGreater(self.store.health()["last_sync"], 0)

    def test_health_reports_portal_sync_offline_when_heartbeat_is_stale(self):
        now = int(time.time())
        self.store._last_sync = now - 180
        health = self.store.health()
        self.assertFalse(health["sync_connected"])
        self.assertGreaterEqual(health["sync_age_seconds"], 180)

        self.store._last_sync = now
        health = self.store.health()
        self.assertTrue(health["sync_connected"])

    def test_sync_requires_key(self):
        request = urllib.request.Request(
            self.base + "/api/sync/player",
            data=json.dumps(snapshot_payload()).encode("utf-8"),
            headers={"Content-Type": "application/json", "X-Crystal-Guild-Key": "wrong"},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request, timeout=3)
        self.assertEqual(caught.exception.code, 401)

    def test_legacy_rest_snapshot_gets_stable_server_deadline(self):
        payload = snapshot_payload("van")
        payload["snapshot"]["overview"]["status"] = {
            "state": "resting", "label": "Resting at Camp", "remaining_seconds": 600,
        }
        with patch("crystal_guild.hosted_portal.time.time", return_value=1_000):
            changed, _ = self.store.upsert_player(payload)
        self.assertTrue(changed)
        self.assertEqual(self.store.module("van", "overview")["status"]["until"], 1_600)

        # Simulate a process/cache restart long after the original receipt. The
        # deadline must still be based on synced_at, not on the new page-load time.
        with self.store._lock:
            self.store._snapshot_cache.clear()
        with patch("crystal_guild.hosted_portal.time.time", return_value=1_300):
            overview = self.store.module("van", "overview")
        self.assertEqual(overview["status"]["until"], 1_600)

    def test_absolute_bot_rest_deadline_remains_authoritative(self):
        payload = snapshot_payload("van")
        payload["snapshot"]["overview"]["status"] = {
            "state": "resting", "label": "Resting at Camp",
            "remaining_seconds": 600, "until": 1_900,
        }
        with patch("crystal_guild.hosted_portal.time.time", return_value=1_000):
            self.store.upsert_player(payload)
        self.assertEqual(self.store.module("van", "overview")["status"]["until"], 1_900)

    def test_sync_and_public_api(self):
        status, result = self.post("/api/sync/player", snapshot_payload())
        self.assertEqual(status, 200)
        self.assertTrue(result["ok"])
        status, body, _ = self.get("/api/players")
        players = json.loads(body)["players"]
        self.assertEqual(players[0]["username"], "van")
        self.assertEqual(players[0]["job_name"], "Dragoon")
        status, body, _ = self.get("/api/player/van")
        self.assertEqual(json.loads(body)["identity"]["level"], 12)


    def test_trophy_hall_uses_authoritative_trophy_snapshot(self):
        payload = snapshot_payload("van")
        payload["snapshot"]["overview"]["identity"]["level"] = 55
        payload["snapshot"]["overview"]["identity"]["title"] = "Crystal Vanguard"
        payload["snapshot"]["trophies"] = {
            "player": {"username": "van", "display_name": "Van"},
            "unlocked": [
                {"id": "raid_ifrit", "unlock_source": "reconciliation", "unlocked_at": "2026-09-22 01:00:00", "seen_at": None},
                {"id": "tt_first_win", "unlock_source": "triple_triad:win", "unlocked_at": "2026-09-22 01:05:00", "seen_at": None},
            ],
        }
        self.post("/api/sync/player", payload)
        status, body, _ = self.get("/api/player/van/trophies")
        hall = json.loads(body)
        self.assertEqual(status, 200)
        self.assertEqual(hall["player"]["title"], "Crystal Vanguard")
        self.assertEqual(hall["summary"], {"unlocked": 2, "total": 30})
        self.assertEqual([item["id"] for item in hall["unlocked"]], ["raid_ifrit", "tt_first_win"])

    def test_private_fields_rejected(self):
        payload = snapshot_payload()
        payload["snapshot"]["overview"]["oauth_token"] = "absolutely-not"
        request = urllib.request.Request(
            self.base + "/api/sync/player",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "X-Crystal-Guild-Key": SYNC_KEY},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request, timeout=3)
        self.assertEqual(caught.exception.code, 400)

    def test_secret_achievement_schema_is_allowed(self):
        payload = snapshot_payload()
        payload["snapshot"]["achievements"] = {
            "summary": {
                "unlocked": 0,
                "total": 1,
                "categories": {"Secret": {"unlocked": 0, "total": 1, "points": 0}},
            },
            "achievements": [
                {
                    "id": "definitely_not_suspicious",
                    "name": "Secret Achievement",
                    "secret": True,
                    "unlocked": False,
                }
            ],
            "titles": [],
        }
        status, result = self.post("/api/sync/player", payload)
        self.assertEqual(status, 200)
        self.assertTrue(result["ok"])

    def test_unexpected_secret_field_is_rejected(self):
        payload = snapshot_payload()
        payload["snapshot"]["overview"]["secret"] = "credential-like-value"
        request = urllib.request.Request(
            self.base + "/api/sync/player",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "X-Crystal-Guild-Key": SYNC_KEY},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request, timeout=3)
        self.assertEqual(caught.exception.code, 400)


    def test_public_reads_survive_database_read_failure_after_cache_warmup(self):
        self.post("/api/sync/player", snapshot_payload("van"))

        def broken_connect():
            raise AssertionError("public read unexpectedly touched SQLite")

        self.store._connect = broken_connect
        status, body, _ = self.get("/api/health")
        self.assertEqual(status, 200)
        health = json.loads(body)
        self.assertFalse(health["ok"])
        self.assertEqual(health["database"], "error")
        self.assertIn("AssertionError", health["error"])
        status, body, _ = self.get("/api/players")
        self.assertEqual(json.loads(body)["players"][0]["username"], "van")
        status, body, _ = self.get("/api/player/van")
        self.assertEqual(json.loads(body)["identity"]["display_name"], "Van")

    def test_large_json_responses_support_gzip(self):
        payload = snapshot_payload("van")
        payload["snapshot"]["achievements"] = {
            "summary": {"unlocked": 1, "total": 1},
            "achievements": [{"id": "large", "description": "Tonberry " * 500}],
        }
        self.post("/api/sync/player", payload)
        request = urllib.request.Request(
            self.base + "/api/player/van/achievements",
            headers={"Accept-Encoding": "gzip"},
        )
        with urllib.request.urlopen(request, timeout=3) as response:
            self.assertEqual(response.headers.get("Content-Encoding"), "gzip")
            decoded = gzip.decompress(response.read()).decode("utf-8")
        self.assertIn("Tonberry", decoded)

    def test_manifest_removes_stale_heroes(self):
        self.post("/api/sync/player", snapshot_payload("van"))
        self.post("/api/sync/player", snapshot_payload("tar"))
        _, result = self.post("/api/sync/manifest", {"usernames": ["van"]})
        self.assertEqual(result["removed"], 1)
        _, body, _ = self.get("/api/players")
        players = json.loads(body)["players"]
        self.assertEqual([row["username"] for row in players], ["van"])

    def test_security_headers_are_present(self):
        for path in ("/", "/api/health"):
            status, _, headers = self.get(path)
            self.assertEqual(status, 200)
            self.assertEqual(headers.get("X-Frame-Options"), "DENY")
            self.assertEqual(headers.get("X-Content-Type-Options"), "nosniff")
            csp = headers.get("Content-Security-Policy", "")
            self.assertIn("frame-ancestors 'none'", csp)
            self.assertIn("https://fonts.googleapis.com", csp)
            self.assertIn("https://fonts.gstatic.com", csp)
            self.assertIn("camera=()", headers.get("Permissions-Policy", ""))

    def test_rejects_invalid_or_mismatched_usernames(self):
        payload = snapshot_payload("van")
        payload["username"] = "../not-a-twitch-user"
        request = urllib.request.Request(
            self.base + "/api/sync/player",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "X-Crystal-Guild-Key": SYNC_KEY},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request, timeout=3)
        self.assertEqual(caught.exception.code, 400)

        payload = snapshot_payload("van")
        payload["snapshot"]["overview"]["identity"]["username"] = "someone_else"
        request = urllib.request.Request(
            self.base + "/api/sync/player",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "X-Crystal-Guild-Key": SYNC_KEY},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request, timeout=3)
        self.assertEqual(caught.exception.code, 400)

    def test_manifest_validation_rejects_bad_entries(self):
        request = urllib.request.Request(
            self.base + "/api/sync/manifest",
            data=json.dumps({"schema_version": 1, "usernames": ["van", "bad/name"]}).encode("utf-8"),
            headers={"Content-Type": "application/json", "X-Crystal-Guild-Key": SYNC_KEY},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request, timeout=3)
        self.assertEqual(caught.exception.code, 400)



if __name__ == "__main__":
    unittest.main()
