from __future__ import annotations

import argparse
import gzip
import hashlib
import hmac
import json
import os
import re
import sqlite3
import threading
import time
from collections import OrderedDict
from contextlib import contextmanager
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse

from .portal_auth import TwitchOAuthClient, TwitchOAuthConfig, random_token, safe_return_path
from .trophy_hall import build_trophy_hall


HOSTED_PORTAL_VERSION = "1.2.0-expeditions-beta2"
FRONTEND_ASSET_REVISION = "1.2.0-expeditions-b2"
SCHEMA_VERSION = 1
ACTION_PROTOCOL_VERSION = 20
ALLOWED_PORTAL_ACTIONS = {
    "RECRUIT", "PING", "EQUIP_ITEM", "UNEQUIP_SLOT", "SET_TITLE", "SHOP_STATE", "BUY_ITEM", "SELL_ITEM",
    "CHARACTER_STATE", "CHANGE_JOB", "SET_STANCE", "SET_MASTERY", "CLEAR_MASTERY",
    "RECOVERY_STATE", "USE_FIELD_ITEM", "START_REST",
    "FELLOWSHIP_STATE", "CONTRIBUTE_GIL", "CONTRIBUTE_ITEM",
    "CRAFTING_STATE", "CRAFT_RECIPE", "FORGE_ITEM", "DAILY_STATE", "CLAIM_DAILY",
    "ADVENTURE_STATE", "TRAVEL_REGION", "SOLO_VENTURE", "SOLO_EXPEDITION_ACTION", "SOLO_EXPEDITION_CONTINUE", "SOLO_EXPEDITION_RETURN", "SOLO_EXPEDITION_RETREAT", "CHALLENGE_HUNT", "ACK_ADVENTURE_RESULT",
    "EXPEDITION_START", "EXPEDITION_RESOLVE_STAGE", "EXPEDITION_ACTION", "EXPEDITION_CONTINUE", "EXPEDITION_CAMP", "EXPEDITION_RETURN", "EXPEDITION_RETREAT",
    "CHOCOBO_STATE", "COMPLETE_CHOCOBO_QUEST", "PURCHASE_CHOCOBO_WRIT", "REGISTER_CHOCOBO", "RENAME_CHOCOBO", "SET_CHOCOBO_PORTRAIT",
    "STREAMER_COMMAND",
}

STREAMER_COMMAND_SPECS = {
    "health": "none",
    "economy": "days",
    "cgversion": "none",
    "encounterdebug": "none",
    "directtest": "none",
    "fellowshipproject": "text",
    "readyall": "none",
    "resettimers": "none",
    "clearadventures": "none",
    "resolveencounter": "none",
    "clearencounter": "none",
    "spawnboss": "text",
    "resolveboss": "none",
    "additem": "inventory",
    "removeitem": "inventory",
}

CHOCOBO_PORTRAIT_IDS = {
    "classic_gold", "midnight_black", "celestial_white", "ember_red", "verdant_green",
    "cobalt_blue", "arcane_violet", "desert_gold", "frost_silver", "rose_pink",
}
MAX_ACTION_BYTES = 16 * 1024
MAX_ACTION_RESULT_BYTES = 64 * 1024
# The authenticated Bot result POST includes protocol/id/lease/message metadata
# around the bounded result payload. Give the HTTP envelope a small, explicit
# allowance while complete_action() still enforces MAX_ACTION_RESULT_BYTES on
# the stored result itself.
MAX_ACTION_RESULT_REQUEST_BYTES = MAX_ACTION_RESULT_BYTES + (4 * 1024)
MAX_ACTION_HISTORY = 20
# Daily Guild Provisions is mounted on Overview and may be retried across page
# refreshes while the Bot is temporarily slow/offline. Treat its state/claim
# requests as one logical in-flight operation per player so browser retries
# cannot flood the bounded Portal relay queue.
# Read/state requests are safe to collapse because only the newest response matters.
READ_ONLY_STATE_ACTIONS = {
    "CHARACTER_STATE", "SHOP_STATE", "RECOVERY_STATE", "FELLOWSHIP_STATE",
    "CRAFTING_STATE", "DAILY_STATE", "CHOCOBO_STATE", "ADVENTURE_STATE",
}
# Gameplay mutations below are also safe to coalesce while one identical request is
# still pending/processing. This prevents a browser retry from applying a Solo
# Venture round twice after the first request completed slowly.
COALESCED_PENDING_ACTIONS = READ_ONLY_STATE_ACTIONS | {
    "CLAIM_DAILY", "SOLO_VENTURE", "SOLO_EXPEDITION_ACTION",
    "SOLO_EXPEDITION_CONTINUE", "SOLO_EXPEDITION_RETURN",
    "SOLO_EXPEDITION_RETREAT", "CHALLENGE_HUNT", "ACK_ADVENTURE_RESULT",
    "EXPEDITION_START", "EXPEDITION_RESOLVE_STAGE", "EXPEDITION_ACTION", "EXPEDITION_CONTINUE",
    "EXPEDITION_CAMP", "EXPEDITION_RETURN", "EXPEDITION_RETREAT",
}
MAX_SYNC_BYTES = 8 * 1024 * 1024
MAX_MANIFEST_PLAYERS = 10000
USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{1,25}$")
SSE_REFRESH_COALESCE_SECONDS = 0.08
DYNAMIC_GZIP_LEVEL = 3
PORTAL_SYNC_STALE_SECONDS = max(30, int(os.getenv("PORTAL_SYNC_STALE_SECONDS", "90")))
FORBIDDEN_KEYS = {
    "token",
    "oauth",
    "oauth_token",
    "client_secret",
    "clientsecret",
    "access_token",
    "accesstoken",
    "refresh_token",
    "refreshtoken",
    "password",
    "passwd",
    "email",
    "ip",
    "ip_address",
    "authorization",
    "api_key",
    "apikey",
    "secret",
    "secret_key",
    "secretkey",
    "sync_key",
    "portal_sync_key",
}


def anchor_camp_deadline(snapshot: dict[str, Any], synced_at: int) -> dict[str, Any]:
    """Give legacy resting snapshots a stable absolute deadline.

    Older Bot snapshots exposed only ``remaining_seconds``. Anchoring that value
    when the hosted Portal receives the snapshot prevents browser refreshes from
    recreating a full countdown from stale data. Newer snapshots already carry
    ``until`` and are left authoritative.
    """
    overview = snapshot.get("overview")
    if not isinstance(overview, dict):
        return snapshot
    status = overview.get("status")
    if not isinstance(status, dict) or status.get("state") != "resting":
        return snapshot

    try:
        absolute_until = int(status.get("until") or status.get("camp_until") or 0)
    except (TypeError, ValueError):
        absolute_until = 0
    if absolute_until > 0:
        status["until"] = absolute_until
        return snapshot

    try:
        remaining = max(0, int(status.get("remaining_seconds") or 0))
    except (TypeError, ValueError):
        remaining = 0
    if remaining > 0 and int(synced_at or 0) > 0:
        status["until"] = int(synced_at) + remaining
    return snapshot



class HostedPortalStore:
    """Sanitized snapshot store used by the publicly hosted portal."""

    def __init__(self, database_path: str | Path):
        self.database_path = Path(database_path).resolve()
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self._condition = threading.Condition(self._lock)
        self._revision = 0
        self._directory_cache: list[dict[str, Any]] = []
        self._alias_cache: dict[str, str] = {}
        self._snapshot_cache: OrderedDict[str, dict[str, Any]] = OrderedDict()
        self._fellowship_cache: dict[str, Any] | None = None
        self._overlay_cache: dict[str, Any] | None = None
        self._snapshot_cache_limit = max(16, int(os.getenv("HOSTED_PORTAL_SNAPSHOT_CACHE", "128")))
        # Streamer View is revision-cached so the broadcaster dashboard does not
        # re-parse every stored snapshot when nothing in the Guild changed.
        self._streamer_cache: dict[str, Any] | None = None
        self._streamer_cache_revision = -1
        self._last_sync = 0
        # Broadcaster authority is supplied by the authenticated Bot manifest.
        # It is intentionally not configurable on the public Web process.
        self._streamer_twitch_id = ""
        self._initialize()
        self._reload_directory_cache()

    @contextmanager
    def _connect(self):
        conn = sqlite3.connect(self.database_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute("PRAGMA temp_store=MEMORY")
        conn.execute("PRAGMA busy_timeout=10000")
        try:
            yield conn
        finally:
            conn.close()

    def _initialize(self) -> None:
        with self._lock, self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS portal_players (
                    username TEXT PRIMARY KEY COLLATE NOCASE,
                    display_name TEXT NOT NULL,
                    level INTEGER NOT NULL DEFAULT 1,
                    job_name TEXT NOT NULL DEFAULT 'Adventurer',
                    title TEXT NOT NULL DEFAULT 'Fresh Recruit',
                    status TEXT NOT NULL DEFAULT 'ready',
                    status_label TEXT NOT NULL DEFAULT 'Ready',
                    snapshot_json TEXT NOT NULL,
                    snapshot_hash TEXT NOT NULL,
                    source_updated_at TEXT,
                    synced_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_portal_players_level
                ON portal_players(level DESC, display_name COLLATE NOCASE);
                CREATE TABLE IF NOT EXISTS portal_fellowship (
                    singleton_id INTEGER PRIMARY KEY CHECK (singleton_id = 1),
                    snapshot_json TEXT NOT NULL,
                    snapshot_hash TEXT NOT NULL,
                    synced_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS portal_overlay (
                    singleton_id INTEGER PRIMARY KEY CHECK (singleton_id = 1),
                    snapshot_json TEXT NOT NULL,
                    snapshot_hash TEXT NOT NULL,
                    synced_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS portal_oauth_states (
                    state_hash TEXT PRIMARY KEY,
                    return_path TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_portal_oauth_states_expires
                ON portal_oauth_states(expires_at);
                CREATE TABLE IF NOT EXISTS portal_sessions (
                    session_hash TEXT PRIMARY KEY,
                    twitch_id TEXT NOT NULL,
                    twitch_login TEXT NOT NULL,
                    twitch_display_name TEXT NOT NULL,
                    csrf_token TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL,
                    last_seen_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_portal_sessions_twitch
                ON portal_sessions(twitch_id, expires_at DESC);
                CREATE TABLE IF NOT EXISTS portal_actions (
                    action_id TEXT PRIMARY KEY,
                    twitch_id TEXT NOT NULL,
                    username TEXT NOT NULL COLLATE NOCASE,
                    action_type TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    idempotency_key TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending',
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    lease_hash TEXT,
                    lease_until INTEGER NOT NULL DEFAULT 0,
                    worker_id TEXT,
                    attempts INTEGER NOT NULL DEFAULT 0,
                    result_json TEXT,
                    UNIQUE(twitch_id, idempotency_key)
                );
                CREATE INDEX IF NOT EXISTS idx_portal_actions_queue
                ON portal_actions(status, created_at);
                CREATE INDEX IF NOT EXISTS idx_portal_actions_player
                ON portal_actions(twitch_id, created_at DESC);
                """
            )
            columns = {row["name"] for row in conn.execute("PRAGMA table_info(portal_players)").fetchall()}
            if "twitch_id" not in columns:
                conn.execute("ALTER TABLE portal_players ADD COLUMN twitch_id TEXT")
            conn.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_portal_players_twitch_id "
                "ON portal_players(twitch_id) WHERE twitch_id IS NOT NULL AND twitch_id <> ''"
            )
            conn.commit()


    def _reload_directory_cache(self) -> None:
        with self._lock, self._connect() as conn:
            rows = conn.execute(
                """
                SELECT username, display_name, level, job_name, title,
                       status, status_label, source_updated_at, synced_at
                FROM portal_players
                ORDER BY level DESC, lower(display_name) ASC
                """
            ).fetchall()
            self._directory_cache = [self._directory_row(row) for row in rows]
            self._alias_cache = {}
            self._last_sync = 0
            for item in self._directory_cache:
                username = item["username"].lower()
                self._alias_cache[username] = username
                self._alias_cache[item["display_name"].lower()] = username
                self._last_sync = max(self._last_sync, int(item["synced_at"]))

    @staticmethod
    def _directory_row(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "username": row["username"],
            "display_name": row["display_name"],
            "level": int(row["level"]),
            "job_name": row["job_name"],
            "title": row["title"],
            "status": row["status"],
            "status_label": row["status_label"],
            "updated_at": row["source_updated_at"],
            "synced_at": int(row["synced_at"]),
        }

    def _cache_snapshot(self, username: str, snapshot: dict[str, Any]) -> None:
        key = username.lower()
        self._snapshot_cache.pop(key, None)
        self._snapshot_cache[key] = snapshot
        while len(self._snapshot_cache) > self._snapshot_cache_limit:
            self._snapshot_cache.popitem(last=False)

    def _cache_directory_entry(self, item: dict[str, Any]) -> None:
        username = item["username"].lower()
        previous = next((row for row in self._directory_cache if row["username"].lower() == username), None)
        if previous:
            self._alias_cache.pop(previous["display_name"].lower(), None)
        self._directory_cache = [row for row in self._directory_cache if row["username"].lower() != username]
        self._directory_cache.append(item)
        self._directory_cache.sort(key=lambda row: (-int(row["level"]), row["display_name"].lower()))
        self._alias_cache[username] = username
        self._alias_cache[item["display_name"].lower()] = username
        self._last_sync = max(self._last_sync, int(item["synced_at"]))

    @property
    def revision(self) -> int:
        with self._lock:
            return self._revision

    def wait_for_revision(self, previous: int, timeout: float = 15.0) -> int:
        with self._condition:
            if self._revision == previous:
                self._condition.wait(timeout=timeout)
            return self._revision

    def _bump_revision(self) -> None:
        self._revision += 1
        self._condition.notify_all()

    def sync_state(self, now: int | None = None) -> dict[str, Any]:
        current = int(time.time()) if now is None else int(now)
        with self._lock:
            last_sync = self._last_sync
        sync_age = max(0, current - last_sync) if last_sync else None
        return {
            "last_sync": last_sync,
            "sync_age_seconds": sync_age,
            "sync_connected": bool(last_sync and sync_age is not None and sync_age <= PORTAL_SYNC_STALE_SECONDS),
            "sync_stale_after_seconds": PORTAL_SYNC_STALE_SECONDS,
        }

    def is_streamer(self, twitch_id: str | None) -> bool:
        candidate = str(twitch_id or "").strip()
        with self._lock:
            owner = self._streamer_twitch_id
        return bool(owner and candidate and hmac.compare_digest(candidate, owner))

    def health(self) -> dict[str, Any]:
        with self._lock:
            players = len(self._directory_cache)
            revision = self._revision
        sync = self.sync_state()
        database_ok = True
        database_error = None
        try:
            with self._connect() as conn:
                row = conn.execute("SELECT 1").fetchone()
                database_ok = bool(row and row[0] == 1)
        except Exception as exc:
            # Health must remain reportable even when opening the hosted mirror
            # itself is the failing operation. Public warmed-cache reads may still
            # be useful while this returns a degraded database status.
            database_ok = False
            database_error = f"{type(exc).__name__}: {exc}"
        result = {
            "ok": database_ok,
            "version": HOSTED_PORTAL_VERSION,
            "frontend_asset_revision": FRONTEND_ASSET_REVISION,
            "schema_version": SCHEMA_VERSION,
            "players": players,
            "revision": revision,
            "database": "ok" if database_ok else "error",
            **sync,
        }
        if database_error:
            result["error"] = database_error
        return result

    @staticmethod
    def _hash_secret(value: str) -> str:
        return hashlib.sha256(value.encode("utf-8")).hexdigest()

    def create_oauth_state(self, return_path: str, ttl_seconds: int) -> str:
        raw = random_token(32)
        now = int(time.time())
        expires = now + max(120, int(ttl_seconds))
        digest = self._hash_secret(raw)
        with self._lock, self._connect() as conn:
            conn.execute("DELETE FROM portal_oauth_states WHERE expires_at<=?", (now,))
            conn.execute(
                "INSERT INTO portal_oauth_states(state_hash,return_path,created_at,expires_at) VALUES (?,?,?,?)",
                (digest, safe_return_path(return_path), now, expires),
            )
            conn.commit()
        return raw

    def consume_oauth_state(self, raw_state: str) -> str | None:
        if not raw_state:
            return None
        now = int(time.time())
        digest = self._hash_secret(raw_state)
        with self._lock, self._connect() as conn:
            row = conn.execute(
                "SELECT return_path,expires_at FROM portal_oauth_states WHERE state_hash=?",
                (digest,),
            ).fetchone()
            conn.execute("DELETE FROM portal_oauth_states WHERE state_hash=? OR expires_at<=?", (digest, now))
            conn.commit()
        if not row or int(row["expires_at"] or 0) < now:
            return None
        return safe_return_path(row["return_path"])

    def create_session(self, twitch_user: dict[str, str], ttl_seconds: int) -> tuple[str, str]:
        twitch_id = str(twitch_user.get("twitch_id") or "").strip()
        login = str(twitch_user.get("login") or "").strip().lower()
        display_name = str(twitch_user.get("display_name") or login).strip()
        if not twitch_id.isdigit() or not login:
            raise ValueError("Invalid Twitch identity.")
        session_token = random_token(36)
        csrf_token = random_token(24)
        now = int(time.time())
        expires = now + max(900, int(ttl_seconds))
        digest = self._hash_secret(session_token)
        with self._lock, self._connect() as conn:
            conn.execute("DELETE FROM portal_sessions WHERE expires_at<=?", (now,))
            conn.execute(
                "INSERT INTO portal_sessions(session_hash,twitch_id,twitch_login,twitch_display_name,csrf_token,created_at,expires_at,last_seen_at) "
                "VALUES (?,?,?,?,?,?,?,?)",
                (digest, twitch_id, login, display_name, csrf_token, now, expires, now),
            )
            conn.commit()
        return session_token, csrf_token

    def session(self, session_token: str | None) -> dict[str, Any] | None:
        token = str(session_token or "").strip()
        if not token:
            return None
        now = int(time.time())
        digest = self._hash_secret(token)
        with self._lock, self._connect() as conn:
            row = conn.execute(
                """
                SELECT s.session_hash,s.twitch_id,s.twitch_login,s.twitch_display_name,
                       s.csrf_token,s.created_at,s.expires_at,s.last_seen_at,
                       p.username AS player_username,p.display_name AS player_display_name,
                       p.level AS player_level,p.job_name AS player_job_name
                FROM portal_sessions s
                LEFT JOIN portal_players p ON p.twitch_id=s.twitch_id
                WHERE s.session_hash=?
                """,
                (digest,),
            ).fetchone()
            if not row:
                return None
            if int(row["expires_at"] or 0) <= now:
                conn.execute("DELETE FROM portal_sessions WHERE session_hash=?", (digest,))
                conn.commit()
                return None
            if now - int(row["last_seen_at"] or 0) >= 60:
                conn.execute("UPDATE portal_sessions SET last_seen_at=? WHERE session_hash=?", (now, digest))
                conn.commit()
        player = None
        if row["player_username"]:
            player = {
                "username": row["player_username"],
                "display_name": row["player_display_name"],
                "level": int(row["player_level"] or 1),
                "job_name": row["player_job_name"],
            }
        return {
            "twitch_id": row["twitch_id"],
            "login": row["twitch_login"],
            "display_name": row["twitch_display_name"],
            "csrf_token": row["csrf_token"],
            "created_at": int(row["created_at"]),
            "expires_at": int(row["expires_at"]),
            "player": player,
        }

    def delete_session(self, session_token: str | None) -> None:
        token = str(session_token or "").strip()
        if not token:
            return
        digest = self._hash_secret(token)
        with self._lock, self._connect() as conn:
            conn.execute("DELETE FROM portal_sessions WHERE session_hash=?", (digest,))
            conn.commit()

    @staticmethod
    def _public_action(row: sqlite3.Row) -> dict[str, Any]:
        result = None
        if row["result_json"]:
            try:
                parsed = json.loads(row["result_json"])
                if isinstance(parsed, dict):
                    result = parsed
            except json.JSONDecodeError:
                result = {"ok": False, "message": "Action result could not be read."}
        return {
            "id": row["action_id"],
            "type": row["action_type"],
            "status": row["status"],
            "created_at": int(row["created_at"]),
            "updated_at": int(row["updated_at"]),
            "attempts": int(row["attempts"] or 0),
            "result": result,
        }

    def create_action(
        self,
        twitch_id: str,
        action_type: str,
        payload: dict[str, Any],
        idempotency_key: str,
        *,
        trusted_username: str | None = None,
        trusted_display_name: str | None = None,
    ) -> dict[str, Any]:
        twitch_id = str(twitch_id).strip()
        kind = str(action_type or "").strip().upper()
        idem = str(idempotency_key or "").strip()
        if kind not in ALLOWED_PORTAL_ACTIONS:
            raise ValueError("That Portal action is not enabled in this build.")
        if len(idem) < 8 or len(idem) > 120 or not re.fullmatch(r"[A-Za-z0-9._:-]+", idem):
            raise ValueError("Invalid action idempotency key.")
        if not isinstance(payload, dict):
            raise ValueError("Action payload must be an object.")
        if kind == "RECRUIT":
            if payload:
                raise ValueError("RECRUIT does not accept parameters.")
            login = str(trusted_username or "").strip().lower()
            display_name = " ".join(str(trusted_display_name or login).strip().split())
            if not USERNAME_RE.fullmatch(login):
                raise ValueError("Portal recruitment could not verify your Twitch login.")
            if not display_name or len(display_name) > 50:
                raise ValueError("Portal recruitment could not verify your Twitch display name.")
            payload = {"display_name": display_name}
        elif kind == "PING":
            if payload:
                raise ValueError("PING does not accept parameters.")
        elif kind == "EQUIP_ITEM":
            if set(payload) != {"item_id"}:
                raise ValueError("EQUIP_ITEM requires only item_id.")
            item_id = str(payload.get("item_id") or "").strip()
            if not item_id or len(item_id) > 100 or not re.fullmatch(r"[A-Za-z0-9_.:-]+", item_id):
                raise ValueError("Invalid equipment item ID.")
            payload = {"item_id": item_id}
        elif kind == "UNEQUIP_SLOT":
            if set(payload) != {"slot"}:
                raise ValueError("UNEQUIP_SLOT requires only slot.")
            slot = str(payload.get("slot") or "").strip().lower()
            if slot not in {"weapon", "armor", "accessory"}:
                raise ValueError("Invalid equipment slot.")
            payload = {"slot": slot}
        elif kind == "SET_TITLE":
            if set(payload) != {"title_id"}:
                raise ValueError("SET_TITLE requires only title_id.")
            title_id = str(payload.get("title_id") or "").strip().lower()
            if not title_id or len(title_id) > 100 or not re.fullmatch(r"[a-z0-9_.:-]+", title_id):
                raise ValueError("Invalid Title ID.")
            payload = {"title_id": title_id}
        elif kind == "CHARACTER_STATE":
            if payload:
                raise ValueError("CHARACTER_STATE does not accept parameters.")
        elif kind == "CHANGE_JOB":
            if set(payload) != {"job_id"}:
                raise ValueError("CHANGE_JOB requires only job_id.")
            job_id = str(payload.get("job_id") or "").strip().lower()
            if not job_id or len(job_id) > 80 or not re.fullmatch(r"[a-z0-9_.:-]+", job_id):
                raise ValueError("Invalid Job ID.")
            payload = {"job_id": job_id}
        elif kind == "SET_STANCE":
            if set(payload) != {"stance"}:
                raise ValueError("SET_STANCE requires only stance.")
            stance = str(payload.get("stance") or "").strip().lower()
            if stance not in {"balanced", "aggressive", "defensive", "magical", "cautious"}:
                raise ValueError("Invalid stance.")
            payload = {"stance": stance}
        elif kind == "SET_MASTERY":
            if set(payload) != {"job_id", "slot"}:
                raise ValueError("SET_MASTERY requires only job_id and slot.")
            job_id = str(payload.get("job_id") or "").strip().lower()
            if not job_id or len(job_id) > 80 or not re.fullmatch(r"[a-z0-9_.:-]+", job_id):
                raise ValueError("Invalid Mastery Job ID.")
            slot = payload.get("slot")
            if isinstance(slot, bool):
                raise ValueError("Invalid Mastery slot.")
            try:
                slot = int(slot)
            except (TypeError, ValueError):
                raise ValueError("Invalid Mastery slot.") from None
            if slot not in {1, 2}:
                raise ValueError("Mastery slot must be 1 or 2.")
            payload = {"job_id": job_id, "slot": slot}
        elif kind == "CLEAR_MASTERY":
            if set(payload) != {"slot"}:
                raise ValueError("CLEAR_MASTERY requires only slot.")
            slot = payload.get("slot")
            if isinstance(slot, bool):
                raise ValueError("Invalid Mastery slot.")
            try:
                slot = int(slot)
            except (TypeError, ValueError):
                raise ValueError("Invalid Mastery slot.") from None
            if slot not in {1, 2}:
                raise ValueError("Mastery slot must be 1 or 2.")
            payload = {"slot": slot}
        elif kind == "SHOP_STATE":
            if payload:
                raise ValueError("SHOP_STATE does not accept parameters.")
        elif kind in {"BUY_ITEM", "SELL_ITEM"}:
            if set(payload) != {"item_id", "quantity"}:
                raise ValueError(f"{kind} requires only item_id and quantity.")
            item_id = str(payload.get("item_id") or "").strip()
            if not item_id or len(item_id) > 100 or not re.fullmatch(r"[A-Za-z0-9_.:-]+", item_id):
                raise ValueError("Invalid shop item ID.")
            quantity = payload.get("quantity")
            if isinstance(quantity, bool):
                raise ValueError("Invalid shop quantity.")
            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                raise ValueError("Invalid shop quantity.") from None
            if quantity < 1 or quantity > 99:
                raise ValueError("Shop quantity must be between 1 and 99.")
            payload = {"item_id": item_id, "quantity": quantity}
        elif kind == "RECOVERY_STATE":
            if payload:
                raise ValueError("RECOVERY_STATE does not accept parameters.")
        elif kind == "USE_FIELD_ITEM":
            if set(payload) - {"item_id", "target_username"} or "item_id" not in payload:
                raise ValueError("USE_FIELD_ITEM accepts item_id and optional target_username.")
            item_id = str(payload.get("item_id") or "").strip()
            if not item_id or len(item_id) > 100 or not re.fullmatch(r"[A-Za-z0-9_.:-]+", item_id):
                raise ValueError("Invalid recovery item ID.")
            target_username = str(payload.get("target_username") or "").strip().lstrip("@").lower()
            if target_username and (len(target_username) > 25 or not re.fullmatch(r"[A-Za-z0-9_]+", target_username)):
                raise ValueError("Invalid field-item target username.")
            payload = {"item_id": item_id}
            if target_username:
                payload["target_username"] = target_username
        elif kind == "START_REST":
            if payload:
                raise ValueError("START_REST does not accept parameters.")
        elif kind == "FELLOWSHIP_STATE":
            if payload:
                raise ValueError("FELLOWSHIP_STATE does not accept parameters.")
        elif kind == "CONTRIBUTE_GIL":
            if set(payload) != {"amount"}:
                raise ValueError("CONTRIBUTE_GIL requires only amount.")
            amount = payload.get("amount")
            if isinstance(amount, bool):
                raise ValueError("Invalid Fellowship Gil amount.")
            try:
                amount = int(amount)
            except (TypeError, ValueError):
                raise ValueError("Invalid Fellowship Gil amount.") from None
            if amount < 1 or amount > 1_000_000:
                raise ValueError("Fellowship Gil amount must be between 1 and 1,000,000.")
            payload = {"amount": amount}
        elif kind == "CONTRIBUTE_ITEM":
            if set(payload) != {"item_id", "quantity"}:
                raise ValueError("CONTRIBUTE_ITEM requires only item_id and quantity.")
            item_id = str(payload.get("item_id") or "").strip()
            if not item_id or len(item_id) > 100 or not re.fullmatch(r"[A-Za-z0-9_.:-]+", item_id):
                raise ValueError("Invalid Fellowship item ID.")
            quantity = payload.get("quantity")
            if isinstance(quantity, bool):
                raise ValueError("Invalid Fellowship item quantity.")
            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                raise ValueError("Invalid Fellowship item quantity.") from None
            if quantity < 1 or quantity > 999:
                raise ValueError("Fellowship item quantity must be between 1 and 999.")
            payload = {"item_id": item_id, "quantity": quantity}
        elif kind in {"CRAFTING_STATE", "DAILY_STATE", "CLAIM_DAILY"}:
            if payload:
                raise ValueError(f"{kind} does not accept parameters.")
        elif kind == "CRAFT_RECIPE":
            if set(payload) != {"recipe_id", "quantity"}:
                raise ValueError("CRAFT_RECIPE requires only recipe_id and quantity.")
            recipe_id = str(payload.get("recipe_id") or "").strip()
            if not recipe_id or len(recipe_id) > 100 or not re.fullmatch(r"[A-Za-z0-9_.:-]+", recipe_id):
                raise ValueError("Invalid crafting recipe ID.")
            quantity = payload.get("quantity")
            if isinstance(quantity, bool):
                raise ValueError("Invalid crafting quantity.")
            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                raise ValueError("Invalid crafting quantity.") from None
            if quantity < 1 or quantity > 20:
                raise ValueError("Craft quantity must be between 1 and 20.")
            payload = {"recipe_id": recipe_id, "quantity": quantity}
        elif kind == "FORGE_ITEM":
            if set(payload) != {"item_id"}:
                raise ValueError("FORGE_ITEM requires only item_id.")
            item_id = str(payload.get("item_id") or "").strip()
            if not item_id or len(item_id) > 100 or not re.fullmatch(r"[A-Za-z0-9_.:-]+", item_id):
                raise ValueError("Invalid forge item ID.")
            payload = {"item_id": item_id}
        elif kind in {"CHOCOBO_STATE", "COMPLETE_CHOCOBO_QUEST", "PURCHASE_CHOCOBO_WRIT"}:
            if payload:
                raise ValueError(f"{kind} does not accept parameters.")
        elif kind in {"REGISTER_CHOCOBO", "RENAME_CHOCOBO"}:
            if set(payload) != {"name"}:
                raise ValueError(f"{kind} requires only name.")
            name = " ".join(str(payload.get("name") or "").strip().split())
            if not 2 <= len(name) <= 20 or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9 '\-]{1,19}", name):
                raise ValueError("Invalid Chocobo name. Use 2–20 letters, numbers, spaces, apostrophes, or hyphens.")
            payload = {"name": name}
        elif kind == "SET_CHOCOBO_PORTRAIT":
            if set(payload) != {"portrait_id"}:
                raise ValueError("SET_CHOCOBO_PORTRAIT requires only portrait_id.")
            portrait_id = str(payload.get("portrait_id") or "").strip().lower()
            if portrait_id not in CHOCOBO_PORTRAIT_IDS:
                raise ValueError("Invalid Chocobo portrait ID.")
            payload = {"portrait_id": portrait_id}
        elif kind in {"ADVENTURE_STATE", "SOLO_VENTURE", "SOLO_EXPEDITION_CONTINUE", "SOLO_EXPEDITION_RETURN", "SOLO_EXPEDITION_RETREAT"}:
            if payload:
                raise ValueError(f"{kind} does not accept parameters.")
        elif kind == "STREAMER_COMMAND":
            if set(payload) - {"command", "argument"} or "command" not in payload:
                raise ValueError("STREAMER_COMMAND requires command and, when needed, argument.")
            command = str(payload.get("command") or "").strip().lower().lstrip("!")
            mode = STREAMER_COMMAND_SPECS.get(command)
            if not mode:
                raise ValueError("That streamer command is not available through the Portal.")
            argument = payload.get("argument", "")
            if mode == "none":
                if str(argument or "").strip():
                    raise ValueError(f"{command} does not accept a Portal argument.")
                payload = {"command": command}
            elif mode == "days":
                if isinstance(argument, bool):
                    raise ValueError("Economy days must be a number between 1 and 90.")
                try:
                    days = int(argument or 7)
                except (TypeError, ValueError):
                    raise ValueError("Economy days must be a number between 1 and 90.") from None
                if days < 1 or days > 90:
                    raise ValueError("Economy days must be between 1 and 90.")
                payload = {"command": command, "argument": days}
            elif mode == "inventory":
                parts = [part.strip() for part in str(argument or "").split("|")]
                if len(parts) not in {2, 3} or not parts[0] or not parts[1]:
                    raise ValueError(f"{command} requires player | item | quantity.")
                target, item = parts[0], parts[1]
                if len(target) > 50 or len(item) > 100:
                    raise ValueError("Streamer inventory target or item is too long.")
                try:
                    quantity = int(parts[2]) if len(parts) == 3 and parts[2] else 1
                except (TypeError, ValueError):
                    raise ValueError("Streamer inventory quantity must be a whole number.") from None
                if quantity < 1 or quantity > 999:
                    raise ValueError("Streamer inventory quantity must be between 1 and 999.")
                payload = {"command": command, "argument": f"{target}|{item}|{quantity}"}
            else:
                text = " ".join(str(argument or "").strip().split())
                if not text or len(text) > 120:
                    raise ValueError(f"{command} requires a short argument.")
                payload = {"command": command, "argument": text}
        elif kind == "SOLO_EXPEDITION_ACTION":
            if set(payload) != {"action"}:
                raise ValueError("SOLO_EXPEDITION_ACTION requires only action.")
            action = str(payload.get("action") or "").strip().lower()
            if not re.fullmatch(r"(?:attack|defend|ability:[a-z0-9_.-]+|item:[a-z0-9_.-]+)", action):
                raise ValueError("Invalid Solo Venture battle action.")
            payload = {"action": action}
        elif kind == "EXPEDITION_START":
            if set(payload) != {"region_id", "depth"}:
                raise ValueError("EXPEDITION_START requires only region_id and depth.")
            region_id = str(payload.get("region_id") or "").strip().lower()
            depth = str(payload.get("depth") or "").strip().lower()
            if not region_id or len(region_id) > 100 or not re.fullmatch(r"[a-z0-9_.:-]+", region_id):
                raise ValueError("Invalid Expedition region ID.")
            if depth not in {"scout", "journey", "deep", "boss", "legendary"}:
                raise ValueError("Invalid Expedition depth.")
            payload = {"region_id": region_id, "depth": depth}
        elif kind in {"EXPEDITION_RESOLVE_STAGE", "EXPEDITION_CAMP", "EXPEDITION_RETURN", "EXPEDITION_RETREAT"}:
            if payload:
                raise ValueError(f"{kind} does not accept parameters.")
        elif kind == "EXPEDITION_ACTION":
            if set(payload) != {"action"}:
                raise ValueError("EXPEDITION_ACTION requires only action.")
            action = str(payload.get("action") or "").strip().lower()
            if not re.fullmatch(r"(?:attack|defend|ability:[a-z0-9_.-]+|item:[a-z0-9_.-]+)", action):
                raise ValueError("Invalid Expedition battle action.")
            payload = {"action": action}
        elif kind == "EXPEDITION_CONTINUE":
            if set(payload) != {"route"}:
                raise ValueError("EXPEDITION_CONTINUE requires only route.")
            route = str(payload.get("route") or "").strip().lower()
            if route not in {"safe", "unknown", "deep"}:
                raise ValueError("Invalid Expedition route.")
            payload = {"route": route}
        elif kind == "TRAVEL_REGION":
            if set(payload) != {"region_id"}:
                raise ValueError("TRAVEL_REGION requires only region_id.")
            region_id = str(payload.get("region_id") or "").strip().lower()
            if not region_id or len(region_id) > 100 or not re.fullmatch(r"[a-z0-9_.:-]+", region_id):
                raise ValueError("Invalid region ID.")
            payload = {"region_id": region_id}
        elif kind == "CHALLENGE_HUNT":
            if set(payload) != {"hunt_id"}:
                raise ValueError("CHALLENGE_HUNT requires only hunt_id.")
            hunt_id = str(payload.get("hunt_id") or "").strip().lower()
            if not hunt_id or len(hunt_id) > 100 or not re.fullmatch(r"[a-z0-9_.:-]+", hunt_id):
                raise ValueError("Invalid Hunt ID.")
            payload = {"hunt_id": hunt_id}
        elif kind == "ACK_ADVENTURE_RESULT":
            if set(payload) != {"result_id"}:
                raise ValueError("ACK_ADVENTURE_RESULT requires only result_id.")
            if isinstance(payload.get("result_id"), bool):
                raise ValueError("Invalid Adventure result ID.")
            try:
                result_id = int(payload.get("result_id") or 0)
            except (TypeError, ValueError):
                raise ValueError("Invalid Adventure result ID.") from None
            if result_id <= 0:
                raise ValueError("Invalid Adventure result ID.")
            payload = {"result_id": result_id}
        encoded = json.dumps(payload, separators=(",", ":"), sort_keys=True, ensure_ascii=False)
        if len(encoded.encode("utf-8")) > MAX_ACTION_BYTES:
            raise ValueError("Action payload is too large.")
        now = int(time.time())
        action_id = f"pa_{random_token(18)}"
        with self._lock, self._connect() as conn:
            existing = conn.execute(
                "SELECT * FROM portal_actions WHERE twitch_id=? AND idempotency_key=?",
                (twitch_id, idem),
            ).fetchone()
            if existing:
                return self._public_action(existing)

            # State panels can refresh automatically while Render or the Bot is
            # waking. Older builds used a fresh idempotency key for each refresh,
            # which could fill the five-action per-player queue with duplicate
            # reads and starve real gameplay actions. Compact those pending reads
            # proactively whenever the player submits anything. A processing row
            # is never cancelled because the Bot may already be executing it.
            state_placeholders = ",".join("?" for _ in READ_ONLY_STATE_ACTIONS)
            state_rows = conn.execute(
                f"""
                SELECT * FROM portal_actions
                WHERE twitch_id=? AND action_type IN ({state_placeholders})
                  AND status IN ('pending','processing')
                ORDER BY action_type,payload_json,
                         CASE status WHEN 'processing' THEN 0 ELSE 1 END,
                         created_at ASC,action_id ASC
                """,
                (twitch_id, *sorted(READ_ONLY_STATE_ACTIONS)),
            ).fetchall()
            state_keepers: set[tuple[str, str]] = set()
            superseded = json.dumps(
                {
                    "ok": False,
                    "message": "A newer matching Portal state request superseded this refresh.",
                    "data": {"coalesced": True},
                },
                separators=(",", ":"),
                sort_keys=True,
                ensure_ascii=False,
            )
            for pending_state in state_rows:
                signature = (str(pending_state["action_type"]), str(pending_state["payload_json"]))
                if signature not in state_keepers:
                    state_keepers.add(signature)
                    continue
                if pending_state["status"] == "pending":
                    conn.execute(
                        """
                        UPDATE portal_actions
                        SET status='failed',result_json=?,lease_hash=NULL,lease_until=0,worker_id=NULL,updated_at=?
                        WHERE action_id=? AND status='pending'
                        """,
                        (superseded, now, pending_state["action_id"]),
                    )

            # Reuse one authoritative in-flight request for browser retries. This
            # covers both state reads and replay-safe Adventure/Daily mutations,
            # preventing delayed Solo Venture clicks from becoming two rounds.
            if kind in COALESCED_PENDING_ACTIONS:
                in_flight = conn.execute(
                    """
                    SELECT * FROM portal_actions
                    WHERE twitch_id=? AND action_type=? AND payload_json=?
                      AND status IN ('pending','processing')
                    ORDER BY CASE status WHEN 'processing' THEN 0 ELSE 1 END,
                             created_at ASC, action_id ASC
                    """,
                    (twitch_id, kind, encoded),
                ).fetchall()
                if in_flight:
                    keeper = in_flight[0]
                    duplicate_result = json.dumps(
                        {
                            "ok": False,
                            "message": "A matching Portal request is already waiting for Crystal Guild.",
                            "data": {"coalesced": True, "replacement_action_id": keeper["action_id"]},
                        },
                        separators=(",", ":"),
                        sort_keys=True,
                        ensure_ascii=False,
                    )
                    for duplicate in in_flight[1:]:
                        if duplicate["status"] != "pending":
                            continue
                        conn.execute(
                            """
                            UPDATE portal_actions
                            SET status='failed',result_json=?,lease_hash=NULL,lease_until=0,worker_id=NULL,updated_at=?
                            WHERE action_id=? AND status='pending'
                            """,
                            (duplicate_result, now, duplicate["action_id"]),
                        )
                    conn.commit()
                    return self._public_action(keeper)

            player = conn.execute(
                "SELECT username FROM portal_players WHERE twitch_id=?",
                (twitch_id,),
            ).fetchone()
            if not player and kind not in {"RECRUIT", "STREAMER_COMMAND"}:
                raise ValueError("Your Twitch account is not linked to a synced Crystal Guild adventurer.")
            action_username = str(player["username"] if player else trusted_username or "").strip().lower()
            if not USERNAME_RE.fullmatch(action_username):
                raise ValueError("Portal action has an invalid Twitch identity.")
            # Keep the relay bounded even if a browser retries aggressively or a
            # signed-in user repeatedly submits while the Bot is slow to poll.
            conn.execute(
                "DELETE FROM portal_actions WHERE status IN ('completed','failed') AND updated_at<?",
                (now - (30 * 24 * 60 * 60),),
            )
            # Read-only state refreshes are separately coalesced and must never
            # consume the mutation queue budget. Otherwise a few stale tab
            # refreshes can prevent Attack/Ability/Daily claim actions entirely.
            if kind not in READ_ONLY_STATE_ACTIONS:
                mutation_placeholders = ",".join("?" for _ in READ_ONLY_STATE_ACTIONS)
                queued = conn.execute(
                    f"""
                    SELECT COUNT(*) AS count FROM portal_actions
                    WHERE twitch_id=? AND status IN ('pending','processing')
                      AND action_type NOT IN ({mutation_placeholders})
                    """,
                    (twitch_id, *sorted(READ_ONLY_STATE_ACTIONS)),
                ).fetchone()
                if int(queued["count"] or 0) >= 5:
                    raise ValueError("Too many gameplay Portal actions are already waiting for the Bot.")
            conn.execute(
                """
                INSERT INTO portal_actions(
                    action_id,twitch_id,username,action_type,payload_json,idempotency_key,
                    status,created_at,updated_at
                ) VALUES (?,?,?,?,?,?,'pending',?,?)
                """,
                (action_id, twitch_id, action_username, kind, encoded, idem, now, now),
            )
            conn.commit()
            row = conn.execute("SELECT * FROM portal_actions WHERE action_id=?", (action_id,)).fetchone()
        return self._public_action(row)

    def list_actions(self, twitch_id: str, limit: int = MAX_ACTION_HISTORY) -> list[dict[str, Any]]:
        safe_limit = min(MAX_ACTION_HISTORY, max(1, int(limit)))
        with self._lock, self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM portal_actions WHERE twitch_id=? ORDER BY created_at DESC, action_id DESC LIMIT ?",
                (str(twitch_id), safe_limit),
            ).fetchall()
        return [self._public_action(row) for row in rows]

    def claim_actions(self, worker_id: str, limit: int = 8, lease_seconds: int = 30) -> list[dict[str, Any]]:
        worker = str(worker_id or "").strip()[:120]
        if not worker:
            raise ValueError("worker_id is required.")
        safe_limit = min(25, max(1, int(limit)))
        now = int(time.time())
        lease_until = now + max(10, min(120, int(lease_seconds)))
        claimed: list[dict[str, Any]] = []
        with self._lock, self._connect() as conn:
            conn.execute("BEGIN IMMEDIATE")
            conn.execute(
                """
                UPDATE portal_actions
                SET status='pending',lease_hash=NULL,lease_until=0,worker_id=NULL,updated_at=?
                WHERE status='processing' AND lease_until>0 AND lease_until<=?
                """,
                (now, now),
            )
            state_placeholders = ",".join("?" for _ in READ_ONLY_STATE_ACTIONS)
            rows = conn.execute(
                f"""
                SELECT a.* FROM portal_actions a
                LEFT JOIN portal_players p ON p.twitch_id=a.twitch_id AND lower(p.username)=lower(a.username)
                WHERE a.status='pending' AND (a.action_type IN ('RECRUIT','STREAMER_COMMAND') OR p.username IS NOT NULL)
                ORDER BY CASE WHEN a.action_type IN ({state_placeholders}) THEN 1 ELSE 0 END,
                         a.created_at ASC,a.action_id ASC
                LIMIT ?
                """,
                (*sorted(READ_ONLY_STATE_ACTIONS), safe_limit),
            ).fetchall()
            for row in rows:
                lease_token = random_token(24)
                lease_hash = self._hash_secret(lease_token)
                updated = conn.execute(
                    """
                    UPDATE portal_actions
                    SET status='processing',lease_hash=?,lease_until=?,worker_id=?,attempts=attempts+1,updated_at=?
                    WHERE action_id=? AND status='pending'
                    """,
                    (lease_hash, lease_until, worker, now, row["action_id"]),
                ).rowcount
                if not updated:
                    continue
                try:
                    action_payload = json.loads(row["payload_json"])
                except json.JSONDecodeError:
                    action_payload = {}
                claimed.append(
                    {
                        "id": row["action_id"],
                        "protocol_version": ACTION_PROTOCOL_VERSION,
                        "twitch_id": row["twitch_id"],
                        "username": row["username"],
                        "type": row["action_type"],
                        "payload": action_payload,
                        "lease_token": lease_token,
                        "lease_until": lease_until,
                        "attempt": int(row["attempts"] or 0) + 1,
                    }
                )
            conn.commit()
        return claimed

    def complete_action(
        self,
        action_id: str,
        lease_token: str,
        ok: bool,
        message: str,
        data: dict[str, Any] | None = None,
    ) -> bool:
        action_id = str(action_id or "").strip()
        lease = str(lease_token or "").strip()
        result_data = data if isinstance(data, dict) else {}
        forbidden = find_forbidden_key(result_data)
        if forbidden:
            raise ValueError(f"Action result contains forbidden private field: {forbidden}")
        result = {
            "ok": bool(ok),
            "message": str(message or ("Completed." if ok else "Action failed."))[:500],
            "data": result_data,
        }
        encoded = json.dumps(result, separators=(",", ":"), sort_keys=True, ensure_ascii=False)
        if len(encoded.encode("utf-8")) > MAX_ACTION_RESULT_BYTES:
            raise ValueError("Action result is too large.")
        now = int(time.time())
        with self._lock, self._connect() as conn:
            row = conn.execute(
                "SELECT status,lease_hash FROM portal_actions WHERE action_id=?",
                (action_id,),
            ).fetchone()
            if not row or row["status"] != "processing" or not row["lease_hash"]:
                return False
            if not hmac.compare_digest(str(row["lease_hash"]), self._hash_secret(lease)):
                return False
            status = "completed" if ok else "failed"
            conn.execute(
                """
                UPDATE portal_actions
                SET status=?,result_json=?,lease_hash=NULL,lease_until=0,worker_id=NULL,updated_at=?
                WHERE action_id=?
                """,
                (status, encoded, now, action_id),
            )
            conn.commit()
        return True

    def upsert_player(self, payload: dict[str, Any]) -> tuple[bool, str]:
        validate_snapshot_payload(payload)
        username = str(payload["username"]).strip().lower()
        player_twitch_id = str(payload.get("player_twitch_id") or "").strip()
        snapshot = payload["snapshot"]
        overview = snapshot["overview"]
        identity = overview["identity"]
        job = overview["job"]
        status = overview["status"]
        synced_at = int(time.time())
        anchor_camp_deadline(snapshot, synced_at)
        encoded = json.dumps(snapshot, separators=(",", ":"), sort_keys=True, ensure_ascii=False)
        digest = hashlib.sha256(encoded.encode("utf-8")).hexdigest()
        changed = False
        with self._condition, self._connect() as conn:
            current = conn.execute(
                "SELECT snapshot_hash,twitch_id FROM portal_players WHERE username=?",
                (username,),
            ).fetchone()
            if not current or current["snapshot_hash"] != digest or (player_twitch_id and current["twitch_id"] != player_twitch_id):
                changed = True
            if player_twitch_id:
                # Twitch login names may change. Numeric Twitch ID is the stable
                # ownership key, so remove an obsolete alias row before inserting
                # the newly synced username. Public snapshots never expose this ID.
                old_rows = conn.execute(
                    "SELECT username FROM portal_players WHERE twitch_id=? AND lower(username)<>lower(?)",
                    (player_twitch_id, username),
                ).fetchall()
                for old_row in old_rows:
                    conn.execute("DELETE FROM portal_players WHERE username=?", (old_row["username"],))
                    old_name = str(old_row["username"]).lower()
                    self._snapshot_cache.pop(old_name, None)
                    self._directory_cache = [row for row in self._directory_cache if row["username"].lower() != old_name]
                    self._alias_cache = {alias: target for alias, target in self._alias_cache.items() if target != old_name}
            conn.execute(
                """
                INSERT INTO portal_players (
                    username, twitch_id, display_name, level, job_name, title,
                    status, status_label, snapshot_json, snapshot_hash,
                    source_updated_at, synced_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(username) DO UPDATE SET
                    twitch_id=CASE WHEN excluded.twitch_id<>'' THEN excluded.twitch_id ELSE portal_players.twitch_id END,
                    display_name=excluded.display_name,
                    level=excluded.level,
                    job_name=excluded.job_name,
                    title=excluded.title,
                    status=excluded.status,
                    status_label=excluded.status_label,
                    snapshot_json=excluded.snapshot_json,
                    snapshot_hash=excluded.snapshot_hash,
                    source_updated_at=excluded.source_updated_at,
                    synced_at=excluded.synced_at
                """,
                (
                    username,
                    player_twitch_id,
                    str(identity.get("display_name") or username),
                    int(identity.get("level") or 1),
                    str(job.get("name") or "Adventurer"),
                    str(identity.get("title") or "Fresh Recruit"),
                    str(status.get("state") or "ready"),
                    str(status.get("label") or "Ready"),
                    encoded,
                    digest,
                    str(identity.get("updated_at") or ""),
                    synced_at,
                ),
            )
            conn.commit()
            directory_item = {
                "username": username,
                "display_name": str(identity.get("display_name") or username),
                "level": int(identity.get("level") or 1),
                "job_name": str(job.get("name") or "Adventurer"),
                "title": str(identity.get("title") or "Fresh Recruit"),
                "status": str(status.get("state") or "ready"),
                "status_label": str(status.get("label") or "Ready"),
                "updated_at": str(identity.get("updated_at") or ""),
                "synced_at": synced_at,
            }
            self._cache_directory_entry(directory_item)
            self._cache_snapshot(username, snapshot)
            if changed:
                self._bump_revision()
        return changed, digest

    def upsert_fellowship(self, payload: dict[str, Any]) -> tuple[bool, str]:
        validate_fellowship_payload(payload)
        snapshot = payload["fellowship"]
        synced_at = int(time.time())
        encoded = json.dumps(snapshot, separators=(",", ":"), sort_keys=True, ensure_ascii=False)
        digest = hashlib.sha256(encoded.encode("utf-8")).hexdigest()
        with self._condition, self._connect() as conn:
            current = conn.execute("SELECT snapshot_hash FROM portal_fellowship WHERE singleton_id=1").fetchone()
            changed = not current or current["snapshot_hash"] != digest
            conn.execute(
                "INSERT INTO portal_fellowship(singleton_id,snapshot_json,snapshot_hash,synced_at) VALUES (1,?,?,?) "
                "ON CONFLICT(singleton_id) DO UPDATE SET snapshot_json=excluded.snapshot_json,snapshot_hash=excluded.snapshot_hash,synced_at=excluded.synced_at",
                (encoded, digest, synced_at),
            )
            conn.commit()
            self._fellowship_cache = snapshot
            self._last_sync = max(self._last_sync, synced_at)
            if changed:
                self._streamer_cache = None
                self._streamer_cache_revision = -1
                self._bump_revision()
        return changed, digest

    def fellowship(self) -> dict[str, Any] | None:
        with self._lock:
            if self._fellowship_cache is not None:
                return dict(self._fellowship_cache)
        with self._connect() as conn:
            row = conn.execute("SELECT snapshot_json,synced_at FROM portal_fellowship WHERE singleton_id=1").fetchone()
        if not row:
            return None
        snapshot = json.loads(row["snapshot_json"])
        with self._lock:
            self._fellowship_cache = snapshot
            self._last_sync = max(self._last_sync, int(row["synced_at"] or 0))
        return dict(snapshot)

    def apply_manifest(self, usernames: list[str], owner_twitch_id: str = "") -> tuple[int, list[str]]:
        normalized = {str(name).strip().lower() for name in usernames if str(name).strip()}
        owner = str(owner_twitch_id or "").strip()
        heartbeat_at = int(time.time())
        with self._condition, self._connect() as conn:
            self._streamer_twitch_id = owner if owner.isdigit() else ""
            rows = conn.execute("SELECT username FROM portal_players").fetchall()
            existing = {row["username"].lower() for row in rows}
            stale = sorted(existing - normalized)
            missing = sorted(normalized - existing)
            for username in stale:
                conn.execute("DELETE FROM portal_players WHERE lower(username)=lower(?)", (username,))
                conn.execute(
                    """
                    UPDATE portal_actions
                    SET status='failed',result_json=?,lease_hash=NULL,lease_until=0,worker_id=NULL,updated_at=?
                    WHERE lower(username)=lower(?) AND status IN ('pending','processing')
                    """,
                    (json.dumps({"ok": False, "message": "Player is no longer available in the hosted Guild.", "data": {}}, separators=(",", ":")), heartbeat_at, username),
                )
            # Commit the hosted mirror before mutating the warmed in-memory view.
            # If disk persistence fails, readers keep the last known-good cache
            # instead of seeing a state the database never committed.
            conn.commit()
            for username in stale:
                self._snapshot_cache.pop(username, None)
                self._directory_cache = [row for row in self._directory_cache if row["username"].lower() != username]
                self._alias_cache = {
                    alias: target for alias, target in self._alias_cache.items() if target != username
                }
            self._last_sync = max(self._last_sync, heartbeat_at)
            if stale:
                self._bump_revision()
        return len(stale), missing

    def upsert_overlay(self, payload: dict[str, Any]) -> tuple[bool, str]:
        validate_overlay_payload(payload)
        snapshot = payload["overlay"]
        synced_at = int(time.time())
        encoded = json.dumps(snapshot, separators=(",", ":"), sort_keys=True, ensure_ascii=False)
        digest = hashlib.sha256(encoded.encode("utf-8")).hexdigest()
        with self._condition, self._connect() as conn:
            current = conn.execute("SELECT snapshot_hash FROM portal_overlay WHERE singleton_id=1").fetchone()
            changed = not current or current["snapshot_hash"] != digest
            conn.execute(
                "INSERT INTO portal_overlay(singleton_id,snapshot_json,snapshot_hash,synced_at) VALUES (1,?,?,?) "
                "ON CONFLICT(singleton_id) DO UPDATE SET snapshot_json=excluded.snapshot_json,snapshot_hash=excluded.snapshot_hash,synced_at=excluded.synced_at",
                (encoded, digest, synced_at),
            )
            conn.commit()
            cached = dict(snapshot)
            cached["synced_at"] = synced_at
            cached["available"] = True
            self._overlay_cache = cached
            self._last_sync = max(self._last_sync, synced_at)
            if changed:
                self._bump_revision()
        return changed, digest

    def overlay(self) -> dict[str, Any] | None:
        with self._lock:
            if self._overlay_cache is not None:
                return dict(self._overlay_cache)
        with self._connect() as conn:
            row = conn.execute("SELECT snapshot_json,synced_at FROM portal_overlay WHERE singleton_id=1").fetchone()
        if not row:
            return None
        snapshot = json.loads(row["snapshot_json"])
        snapshot["synced_at"] = int(row["synced_at"] or 0)
        snapshot["available"] = True
        with self._lock:
            self._overlay_cache = dict(snapshot)
        return snapshot

    def list_players(self, search: str = "") -> list[dict[str, Any]]:
        term = search.strip().lower()
        with self._lock:
            rows = list(self._directory_cache)
        if term:
            rows = [
                row for row in rows
                if term in row["username"].lower() or term in row["display_name"].lower()
            ]
        return [dict(row) for row in rows]

    def streamer_dashboard(self) -> dict[str, Any]:
        """Return one compact, sanitized snapshot for the broadcaster dashboard.

        Streamer View intentionally aggregates only fields already present in the
        public player snapshots. It does not expose Bot settings, credentials,
        runtime command authority, or the private authoritative database.
        """
        with self._lock:
            revision = self._revision
            last_sync = self._last_sync
            if self._streamer_cache is not None and self._streamer_cache_revision == revision:
                cached = dict(self._streamer_cache)
                cached["last_sync"] = last_sync
                cached["revision"] = revision
                return cached

        try:
            with self._connect() as conn:
                rows = conn.execute(
                """
                SELECT username, display_name, level, job_name, title, status,
                       status_label, source_updated_at, synced_at, snapshot_json
                FROM portal_players
                ORDER BY level DESC, lower(display_name) ASC
                """
                ).fetchall()
        except sqlite3.Error:
            # A warmed Streamer View can remain useful during a transient hosted
            # mirror read failure, matching the resilience of public player APIs.
            with self._lock:
                if self._streamer_cache is not None:
                    cached = dict(self._streamer_cache)
                    cached["last_sync"] = self._last_sync
                    cached["revision"] = self._revision
                    cached["degraded"] = True
                    return cached
            raise

        players: list[dict[str, Any]] = []
        activity: list[dict[str, Any]] = []
        ready = resting = ko = 0
        total_level = 0

        for row in rows:
            snapshot = json.loads(row["snapshot_json"])
            overview = snapshot.get("overview") or {}
            identity = overview.get("identity") or {}
            job = overview.get("job") or {}
            status = overview.get("status") or {}
            hp = overview.get("hp") or {}
            counts = overview.get("counts") or {}
            region = overview.get("region") or {}

            raw_state = str(status.get("state") or row["status"] or "ready")
            # Streamer filters use three operational buckets. Transitional ready
            # states remain player-facing through status_label but group as Ready.
            state = raw_state if raw_state in {"resting", "ko"} else "ready"
            if state == "resting":
                resting += 1
            elif state == "ko":
                ko += 1
            else:
                ready += 1

            level = int(identity.get("level") or row["level"] or 1)
            total_level += level
            player = {
                "username": row["username"],
                "display_name": str(identity.get("display_name") or row["display_name"]),
                "level": level,
                "title": str(identity.get("title") or row["title"]),
                "job_name": str(job.get("name") or row["job_name"]),
                "job_level": int(job.get("level") or 0),
                "status": state,
                "status_label": str(status.get("label") or row["status_label"]),
                "hp_current": int(hp.get("current") or 0),
                "hp_max": int(hp.get("max") or 0),
                "region": str(region.get("name") or "Unknown"),
                "gil": int(identity.get("gil") or 0),
                "hunt_seals": int(identity.get("hunt_seals") or 0),
                "achievements": int(counts.get("achievements") or 0),
                "mastered_jobs": int(counts.get("mastered_jobs") or 0),
                "boss_clears": int(counts.get("boss_clears") or 0),
                "hunt_clears": int(counts.get("hunts") or 0),
                "relics": int(counts.get("relics") or 0),
                "bestiary": int(counts.get("bestiary") or 0),
                "updated_at": str(identity.get("updated_at") or row["source_updated_at"] or ""),
                "synced_at": int(row["synced_at"] or 0),
            }
            players.append(player)

            for event in overview.get("recent_activity") or []:
                if not isinstance(event, dict):
                    continue
                activity.append({
                    "username": row["username"],
                    "display_name": player["display_name"],
                    "kind": str(event.get("kind") or "activity"),
                    "asset": str(event.get("asset") or "Activity"),
                    "amount": int(event.get("amount") or 0),
                    "source": str(event.get("source") or "guild"),
                    "created_at": str(event.get("created_at") or ""),
                })

        activity.sort(key=lambda item: item["created_at"], reverse=True)
        activity = activity[:24]

        def leader(metric: str) -> dict[str, Any] | None:
            if not players:
                return None
            winner = max(players, key=lambda item: (int(item.get(metric) or 0), int(item["level"])))
            return {
                "username": winner["username"],
                "display_name": winner["display_name"],
                "value": int(winner.get(metric) or 0),
            }

        result = {
            "summary": {
                "total": len(players),
                "ready": ready,
                "resting": resting,
                "ko": ko,
                "average_level": round(total_level / len(players), 1) if players else 0,
            },
            "leaders": {
                "level": leader("level"),
                "boss_clears": leader("boss_clears"),
                "mastered_jobs": leader("mastered_jobs"),
                "achievements": leader("achievements"),
            },
            "players": players,
            "activity": activity,
            "fellowship": self.fellowship(),
            "last_sync": last_sync,
            "revision": revision,
            "degraded": False,
        }
        with self._lock:
            self._streamer_cache = result
            self._streamer_cache_revision = revision
        return result

    def module(self, key: str, module: str) -> dict[str, Any] | None:
        lookup = unquote(key).strip().lower()
        with self._lock:
            username = self._alias_cache.get(lookup, lookup)
            snapshot = self._snapshot_cache.get(username)
            if snapshot is not None:
                self._snapshot_cache.move_to_end(username)
                return build_trophy_hall(snapshot) if module == "trophies" else snapshot.get(module)
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT username, snapshot_json, synced_at FROM portal_players
                WHERE lower(username)=lower(?) OR lower(display_name)=lower(?)
                LIMIT 1
                """,
                (lookup, lookup),
            ).fetchone()
        if not row:
            return None
        snapshot = json.loads(row["snapshot_json"])
        anchor_camp_deadline(snapshot, int(row["synced_at"] or 0))
        username = row["username"].lower()
        with self._lock:
            self._alias_cache[lookup] = username
            self._cache_snapshot(username, snapshot)
        return build_trophy_hall(snapshot) if module == "trophies" else snapshot.get(module)


def validate_snapshot_payload(payload: dict[str, Any]) -> None:
    if int(payload.get("schema_version", 0)) != SCHEMA_VERSION:
        raise ValueError("Unsupported hosted portal snapshot schema.")
    username = str(payload.get("username") or "").strip()
    if not USERNAME_RE.fullmatch(username):
        raise ValueError("Snapshot username is missing or invalid.")
    player_twitch_id = str(payload.get("player_twitch_id") or "").strip()
    if player_twitch_id and (not player_twitch_id.isdigit() or len(player_twitch_id) > 30):
        raise ValueError("Snapshot player_twitch_id is invalid.")
    snapshot = payload.get("snapshot")
    if not isinstance(snapshot, dict):
        raise ValueError("Snapshot body is missing.")
    required = {
        "overview",
        "jobs",
        "inventory",
        "hunts",
        "bestiary",
        "relics",
        "achievements",
        "records",
    }
    if not required.issubset(snapshot):
        raise ValueError("Snapshot is missing one or more required modules.")
    forbidden = find_forbidden_key(snapshot)
    if forbidden:
        raise ValueError(f"Snapshot contains forbidden private field: {forbidden}")
    identity_username = str(((snapshot.get("overview") or {}).get("identity") or {}).get("username") or "").strip()
    if identity_username and identity_username.lower() != username.lower():
        raise ValueError("Snapshot username does not match overview identity.")


def validate_fellowship_payload(payload: dict[str, Any]) -> None:
    if int(payload.get("schema_version", 0)) != SCHEMA_VERSION:
        raise ValueError("Unsupported hosted portal Fellowship schema.")
    fellowship = payload.get("fellowship")
    if not isinstance(fellowship, dict):
        raise ValueError("Fellowship snapshot body is missing.")
    forbidden = find_forbidden_key(fellowship)
    if forbidden:
        raise ValueError(f"Fellowship snapshot contains forbidden private field: {forbidden}")


def validate_overlay_payload(payload: dict[str, Any]) -> None:
    if int(payload.get("schema_version", 0)) != SCHEMA_VERSION:
        raise ValueError("Unsupported hosted portal Overlay schema.")
    overlay = payload.get("overlay")
    if not isinstance(overlay, dict):
        raise ValueError("Overlay snapshot body is missing.")
    forbidden = find_forbidden_key(overlay)
    if forbidden:
        raise ValueError(f"Overlay snapshot contains forbidden private field: {forbidden}")
    allowed = {
        "active", "status", "boss", "tier", "hp", "max_hp", "round", "phase",
        "signature", "raiders", "alive", "enraged", "summon_gauge", "top", "updated_at",
    }
    extra = set(overlay) - allowed
    if extra:
        raise ValueError(f"Overlay snapshot contains unsupported field: {sorted(extra)[0]}")
    top = overlay.get("top", [])
    if not isinstance(top, list) or len(top) > 5:
        raise ValueError("Overlay top-damage list is invalid.")
    for item in top:
        if not isinstance(item, dict) or set(item) - {"name", "damage", "healing"}:
            raise ValueError("Overlay top-damage entry is invalid.")


def validate_manifest_payload(payload: dict[str, Any]) -> tuple[list[str], str]:
    schema = payload.get("schema_version")
    if schema is not None and int(schema) != SCHEMA_VERSION:
        raise ValueError("Unsupported hosted portal manifest schema.")
    usernames = payload.get("usernames")
    if not isinstance(usernames, list):
        raise ValueError("Manifest usernames must be a list.")
    if len(usernames) > MAX_MANIFEST_PLAYERS:
        raise ValueError("Manifest contains too many players.")
    normalized: list[str] = []
    seen: set[str] = set()
    for raw in usernames:
        username = str(raw).strip().lower()
        if not USERNAME_RE.fullmatch(username):
            raise ValueError("Manifest contains an invalid username.")
        if username not in seen:
            normalized.append(username)
            seen.add(username)
    owner_twitch_id = str(payload.get("owner_twitch_id") or "").strip()
    if owner_twitch_id and not owner_twitch_id.isdigit():
        raise ValueError("Manifest owner Twitch ID is invalid.")
    return normalized, owner_twitch_id


def _normalized_key(key: Any) -> str:
    return str(key).strip().lower().replace("-", "_").replace(" ", "_")


def _allowed_game_secret(child: Any) -> bool:
    # ``secret`` is a valid field for hidden achievements and
    # ``Secret`` as an achievement-category summary key. Keep those narrow
    # shapes valid without weakening protection for credential-style secrets.
    if isinstance(child, bool):
        return True
    if not isinstance(child, dict):
        return False
    allowed = {"unlocked", "total", "points"}
    if not set(child).issubset(allowed):
        return False
    return all(isinstance(value, (int, float)) and not isinstance(value, bool) for value in child.values())


def _forbidden_field(key: Any, child: Any) -> bool:
    lowered = _normalized_key(key)
    if lowered == "secret" and _allowed_game_secret(child):
        return False
    if lowered in FORBIDDEN_KEYS:
        return True
    credential_suffixes = ("_token", "_password", "_passwd", "_secret", "_secret_key")
    return lowered.startswith("oauth_") or lowered.endswith(credential_suffixes)


def find_forbidden_key(value: Any) -> str | None:
    if isinstance(value, dict):
        for key, child in value.items():
            if _forbidden_field(key, child):
                return str(key)
            found = find_forbidden_key(child)
            if found:
                return found
    elif isinstance(value, list):
        for child in value:
            found = find_forbidden_key(child)
            if found:
                return found
    return None


class HostedPortalHTTPServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    request_queue_size = 128

    def __init__(
        self,
        address: tuple[str, int],
        handler: type[BaseHTTPRequestHandler],
        store: HostedPortalStore,
        static_dir: Path,
        sync_key: str,
        oauth_config: TwitchOAuthConfig | None = None,
        oauth_client: TwitchOAuthClient | None = None,
        actions_enabled: bool = True,
    ):
        super().__init__(address, handler)
        self.store = store
        self.static_dir = static_dir.resolve()
        self.sync_key = sync_key
        self.oauth_config = oauth_config or TwitchOAuthConfig("", "", "", cookie_secure=False)
        self.oauth_client = oauth_client or TwitchOAuthClient(self.oauth_config)
        self.actions_enabled = bool(actions_enabled)
        self.action_lease_seconds = max(10, min(120, int(os.getenv("PORTAL_ACTION_LEASE_SECONDS", "30"))))
        self.static_cache: dict[Path, tuple[int, int, str, bytes, bytes | None]] = {}
        self.static_cache_lock = threading.RLock()


class HostedPortalHandler(BaseHTTPRequestHandler):
    server_version = f"CrystalGuildHostedPortal/{HOSTED_PORTAL_VERSION}"
    protocol_version = "HTTP/1.1"

    def setup(self) -> None:
        super().setup()
        self.connection.settimeout(45.0)

    @property
    def portal(self) -> HostedPortalHTTPServer:
        return self.server  # type: ignore[return-value]

    def log_message(self, fmt: str, *args: Any) -> None:
        if os.getenv("HOSTED_PORTAL_ACCESS_LOG", "0").lower() in {"1", "true", "yes"}:
            super().log_message(fmt, *args)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/auth/twitch":
            self._begin_twitch_login(parsed)
            return
        if path == "/auth/twitch/callback":
            self._finish_twitch_login(parsed)
            return
        if path == "/api/auth/status":
            self._auth_status()
            return
        if path == "/api/actions":
            self._action_history()
            return
        if path == "/api/health":
            health = self.portal.store.health()
            health["portal_auth_configured"] = self.portal.oauth_config.enabled
            health["portal_actions_enabled"] = bool(self.portal.actions_enabled and self.portal.oauth_config.enabled)
            health["action_protocol_version"] = ACTION_PROTOCOL_VERSION
            self._json(health)
            return
        if path == "/api/players":
            search = parse_qs(parsed.query).get("search", [""])[0]
            self._json({"players": self.portal.store.list_players(search)})
            return
        if path == "/api/streamer":
            self._json(self.portal.store.streamer_dashboard())
            return
        if path == "/api/fellowship":
            payload = self.portal.store.fellowship()
            self._json(payload if payload is not None else {"available": False})
            return
        if path == "/api/overlay/state":
            payload = self.portal.store.overlay()
            self._json(payload if payload is not None else {"available": False, "active": False, "status": "IDLE"})
            return
        if path == "/api/events":
            self._events()
            return
        if path.startswith("/api/player/"):
            self._player_api(path)
            return
        if path in {"/overlay", "/overlay/"}:
            self._serve_file(self.portal.static_dir / "raid-overlay.html")
            return
        if path in {"/", "/players", "/fellowship", "/fellowship/", "/guide", "/guide/", "/streamer", "/streamer/", "/privacy", "/privacy/"} or path.startswith(("/player/", "/guide/")):
            self._serve_file(self.portal.static_dir / "index.html")
            return
        self._serve_static(path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/api/auth/logout":
            self._logout()
            return
        if path == "/api/actions":
            self._submit_action()
            return
        if path in {"/api/actions/claim", "/api/actions/result"}:
            if not self._authorized():
                self._json({"error": "Unauthorized."}, HTTPStatus.UNAUTHORIZED)
                return
            try:
                payload = self._read_json(
                    MAX_ACTION_BYTES if path == "/api/actions/claim" else MAX_ACTION_RESULT_REQUEST_BYTES
                )
                if path == "/api/actions/claim":
                    if int(payload.get("protocol_version") or 0) != ACTION_PROTOCOL_VERSION:
                        raise ValueError("Unsupported Portal action protocol version.")
                    worker_id = str(payload.get("worker_id") or "").strip()
                    limit = int(payload.get("limit") or 8)
                    actions = self.portal.store.claim_actions(
                        worker_id,
                        limit=limit,
                        lease_seconds=self.portal.action_lease_seconds,
                    )
                    self._json({"ok": True, "protocol_version": ACTION_PROTOCOL_VERSION, "actions": actions})
                else:
                    if int(payload.get("protocol_version") or ACTION_PROTOCOL_VERSION) != ACTION_PROTOCOL_VERSION:
                        raise ValueError("Unsupported Portal action protocol version.")
                    ok = self.portal.store.complete_action(
                        str(payload.get("id") or ""),
                        str(payload.get("lease_token") or ""),
                        bool(payload.get("ok")),
                        str(payload.get("message") or ""),
                        payload.get("data") if isinstance(payload.get("data"), dict) else {},
                    )
                    if not ok:
                        self._json({"error": "Action lease is no longer valid."}, HTTPStatus.CONFLICT)
                    else:
                        self._json({"ok": True})
            except (ValueError, json.JSONDecodeError) as exc:
                self._json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
            except Exception as exc:
                self._json({"error": f"Portal action relay failed: {exc}"}, HTTPStatus.INTERNAL_SERVER_ERROR)
            return

        if path not in {"/api/sync/player", "/api/sync/manifest", "/api/sync/fellowship", "/api/sync/overlay"}:
            self._json({"error": "Not found."}, HTTPStatus.NOT_FOUND)
            return
        if not self._authorized():
            self._json({"error": "Unauthorized."}, HTTPStatus.UNAUTHORIZED)
            return
        try:
            payload = self._read_json()
            if path == "/api/sync/player":
                changed, digest = self.portal.store.upsert_player(payload)
                self._json({"ok": True, "changed": changed, "hash": digest})
            elif path == "/api/sync/fellowship":
                changed, digest = self.portal.store.upsert_fellowship(payload)
                self._json({"ok": True, "changed": changed, "hash": digest})
            elif path == "/api/sync/overlay":
                changed, digest = self.portal.store.upsert_overlay(payload)
                self._json({"ok": True, "changed": changed, "hash": digest})
            else:
                usernames, owner_twitch_id = validate_manifest_payload(payload)
                removed, missing = self.portal.store.apply_manifest(usernames, owner_twitch_id)
                self._json({"ok": True, "removed": removed, "missing": missing})
        except (ValueError, json.JSONDecodeError) as exc:
            self._json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            self._json({"error": f"Sync failed: {exc}"}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def _authorized(self) -> bool:
        supplied = self.headers.get("X-Crystal-Guild-Key", "")
        return bool(self.portal.sync_key) and hmac.compare_digest(supplied, self.portal.sync_key)

    def _read_json(self, max_bytes: int = MAX_SYNC_BYTES) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise ValueError("Invalid content length.") from exc
        if length <= 0 or length > max_bytes:
            raise ValueError("Request payload size is invalid.")
        raw = self.rfile.read(length)
        payload = json.loads(raw.decode("utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("Request payload must be an object.")
        return payload

    def _cookie(self, name: str) -> str:
        raw = self.headers.get("Cookie", "")
        if not raw:
            return ""
        jar = SimpleCookie()
        try:
            jar.load(raw)
        except Exception:
            return ""
        morsel = jar.get(name)
        return morsel.value if morsel else ""

    def _cookie_header(
        self,
        name: str,
        value: str,
        *,
        max_age: int,
        http_only: bool = True,
        same_site: str = "Lax",
    ) -> str:
        parts = [f"{name}={value}", "Path=/", f"Max-Age={max(0, int(max_age))}", f"SameSite={same_site}"]
        if http_only:
            parts.append("HttpOnly")
        if self.portal.oauth_config.cookie_secure:
            parts.append("Secure")
        return "; ".join(parts)

    def _session(self) -> dict[str, Any] | None:
        return self.portal.store.session(self._cookie("cg_session"))

    def _csrf_valid(self, session: dict[str, Any] | None) -> bool:
        if not session:
            return False
        supplied = self.headers.get("X-Crystal-Guild-CSRF", "")
        expected = str(session.get("csrf_token") or "")
        return bool(supplied and expected and hmac.compare_digest(supplied, expected))

    def _begin_twitch_login(self, parsed) -> None:
        if not self.portal.oauth_config.enabled:
            self._json({"error": "Twitch login is not configured for this Portal."}, HTTPStatus.SERVICE_UNAVAILABLE)
            return
        query = parse_qs(parsed.query)
        return_path = safe_return_path(query.get("return", ["/players"])[0])
        state = self.portal.store.create_oauth_state(return_path, self.portal.oauth_config.state_ttl_seconds)
        location = self.portal.oauth_client.authorization_url(state)
        self._redirect(
            location,
            cookies=[
                self._cookie_header(
                    "cg_oauth_state",
                    state,
                    max_age=self.portal.oauth_config.state_ttl_seconds,
                    http_only=True,
                    same_site="Lax",
                )
            ],
        )

    def _finish_twitch_login(self, parsed) -> None:
        query = parse_qs(parsed.query)
        state = str(query.get("state", [""])[0])
        cookie_state = self._cookie("cg_oauth_state")
        fallback = "/players"
        if not state or not cookie_state or not hmac.compare_digest(state, cookie_state):
            self._redirect(f"{fallback}?auth=invalid_state", cookies=[self._cookie_header("cg_oauth_state", "", max_age=0)])
            return
        return_path = self.portal.store.consume_oauth_state(state)
        if not return_path:
            self._redirect(f"{fallback}?auth=expired", cookies=[self._cookie_header("cg_oauth_state", "", max_age=0)])
            return
        error = str(query.get("error", [""])[0])
        if error:
            self._redirect(
                f"{return_path}{'&' if '?' in return_path else '?'}auth=cancelled",
                cookies=[self._cookie_header("cg_oauth_state", "", max_age=0)],
            )
            return
        code = str(query.get("code", [""])[0])
        if not code:
            self._redirect(
                f"{return_path}{'&' if '?' in return_path else '?'}auth=missing_code",
                cookies=[self._cookie_header("cg_oauth_state", "", max_age=0)],
            )
            return
        try:
            twitch_user = self.portal.oauth_client.authenticate_code(code)
            session_token, _ = self.portal.store.create_session(
                twitch_user,
                self.portal.oauth_config.session_ttl_seconds,
            )
        except Exception:
            self._redirect(
                f"{return_path}{'&' if '?' in return_path else '?'}auth=failed",
                cookies=[self._cookie_header("cg_oauth_state", "", max_age=0)],
            )
            return
        self._redirect(
            f"{return_path}{'&' if '?' in return_path else '?'}auth=ok",
            cookies=[
                self._cookie_header("cg_oauth_state", "", max_age=0),
                self._cookie_header(
                    "cg_session",
                    session_token,
                    max_age=self.portal.oauth_config.session_ttl_seconds,
                    http_only=True,
                    same_site="Lax",
                ),
            ],
        )

    def _auth_status(self) -> None:
        session = self._session()
        sync = self.portal.store.sync_state()
        configured = bool(self.portal.oauth_config.enabled)
        if not session:
            self._json(
                {
                    "configured": configured,
                    "authenticated": False,
                    "actions_enabled": False,
                    "action_protocol_version": ACTION_PROTOCOL_VERSION,
                    "action_capabilities": sorted(ALLOWED_PORTAL_ACTIONS - {"STREAMER_COMMAND"}),
                    "streamer_authorized": False,
                    **sync,
                }
            )
            return
        player = session.get("player")
        actions_enabled = bool(
            configured
            and self.portal.actions_enabled
            and sync.get("sync_connected")
        )
        streamer_authorized = self.portal.store.is_streamer(session.get("twitch_id"))
        capabilities = set(ALLOWED_PORTAL_ACTIONS)
        if not streamer_authorized:
            capabilities.discard("STREAMER_COMMAND")
        self._json(
            {
                "configured": configured,
                "authenticated": True,
                "twitch": {
                    "login": session["login"],
                    "display_name": session["display_name"],
                },
                "player": player,
                "csrf_token": session["csrf_token"],
                "expires_at": session["expires_at"],
                "actions_enabled": actions_enabled,
                "can_recruit": bool(actions_enabled and not player),
                "streamer_authorized": streamer_authorized,
                "action_protocol_version": ACTION_PROTOCOL_VERSION,
                "action_capabilities": sorted(capabilities),
                **sync,
            }
        )

    def _logout(self) -> None:
        session_token = self._cookie("cg_session")
        session = self.portal.store.session(session_token)
        if session and not self._csrf_valid(session):
            self._json({"error": "Invalid session protection token."}, HTTPStatus.FORBIDDEN)
            return
        self.portal.store.delete_session(session_token)
        self._json(
            {"ok": True},
            extra_headers=[("Set-Cookie", self._cookie_header("cg_session", "", max_age=0))],
        )

    def _submit_action(self) -> None:
        session = self._session()
        if not session:
            self._json({"error": "Sign in with Twitch before using Portal actions."}, HTTPStatus.UNAUTHORIZED)
            return
        if not self._csrf_valid(session):
            self._json({"error": "Invalid session protection token."}, HTTPStatus.FORBIDDEN)
            return
        if not self.portal.actions_enabled:
            self._json({"error": "Portal actions are disabled."}, HTTPStatus.SERVICE_UNAVAILABLE)
            return
        if not self.portal.store.sync_state().get("sync_connected"):
            self._json({"error": "Crystal Guild Bot is currently offline. Portal actions are unavailable."}, HTTPStatus.SERVICE_UNAVAILABLE)
            return
        try:
            payload = self._read_json(MAX_ACTION_BYTES)
            action_type = str(payload.get("type") or "").strip().upper()
            if action_type == "STREAMER_COMMAND" and not self.portal.store.is_streamer(session.get("twitch_id")):
                self._json({"error": "This Twitch account is not authorized for Streamer Controls."}, HTTPStatus.FORBIDDEN)
                return
            if not session.get("player") and action_type not in {"RECRUIT", "STREAMER_COMMAND"}:
                self._json({"error": "Create your Crystal Guild adventurer before using other Portal actions."}, HTTPStatus.FORBIDDEN)
                return
            action = self.portal.store.create_action(
                session["twitch_id"],
                action_type,
                payload.get("payload") if isinstance(payload.get("payload"), dict) else {},
                self.headers.get("Idempotency-Key", ""),
                trusted_username=session.get("login"),
                trusted_display_name=session.get("display_name"),
            )
            self._json({"ok": True, "action": action}, HTTPStatus.ACCEPTED)
        except (ValueError, json.JSONDecodeError) as exc:
            self._json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            self._json({"error": f"Could not queue Portal action: {exc}"}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def _action_history(self) -> None:
        session = self._session()
        if not session:
            self._json({"error": "Sign in with Twitch before viewing Portal actions."}, HTTPStatus.UNAUTHORIZED)
            return
        self._json({"actions": self.portal.store.list_actions(session["twitch_id"])})

    def _player_api(self, path: str) -> None:
        parts = [part for part in path.split("/") if part]
        if len(parts) < 3:
            self._json({"error": "Player not specified."}, HTTPStatus.BAD_REQUEST)
            return
        key = parts[2]
        module = parts[3] if len(parts) > 3 else "overview"
        aliases = {"overview": "overview"}
        valid = {
            "overview",
            "jobs",
            "inventory",
            "hunts",
            "bestiary",
            "relics",
            "achievements",
            "records",
            "trophies",
        }
        module = aliases.get(module, module)
        if module not in valid:
            self._json({"error": "Unknown player module."}, HTTPStatus.NOT_FOUND)
            return
        payload = self.portal.store.module(key, module)
        if payload is None:
            self._json({"error": "Hero not found."}, HTTPStatus.NOT_FOUND)
            return
        self._json(payload)

    def _events(self) -> None:
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-store, no-transform")
        self.send_header("Pragma", "no-cache")
        self._security_headers()
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()
        revision = self.portal.store.revision
        try:
            self.wfile.write(b"retry: 2000\n\n")
            self.wfile.flush()
            self._write_event(
                "ready",
                {"revision": revision, "ts": int(time.time()), **self.portal.store.sync_state()},
            )
            while True:
                next_revision = self.portal.store.wait_for_revision(revision, timeout=10.0)
                if next_revision != revision:
                    # Briefly coalesce a multi-player sync batch without making
                    # the Portal feel sluggish after the source revision changes.
                    time.sleep(SSE_REFRESH_COALESCE_SECONDS)
                    revision = self.portal.store.revision
                    self._write_event(
                        "refresh",
                        {"revision": revision, "ts": int(time.time()), **self.portal.store.sync_state()},
                    )
                else:
                    self._write_event(
                        "heartbeat",
                        {"revision": revision, "ts": int(time.time()), **self.portal.store.sync_state()},
                    )
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, TimeoutError, OSError):
            return

    def _write_event(self, event: str, payload: dict[str, Any]) -> None:
        encoded = json.dumps(payload, separators=(",", ":"))
        self.wfile.write(f"event: {event}\ndata: {encoded}\n\n".encode("utf-8"))
        self.wfile.flush()

    def _security_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; "
            "object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
        )

    def _serve_static(self, path: str) -> None:
        relative = path.lstrip("/") or "index.html"
        target = (self.portal.static_dir / relative).resolve()
        if self.portal.static_dir not in target.parents and target != self.portal.static_dir:
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        self._serve_file(target)

    @staticmethod
    def _compressible(content_type: str) -> bool:
        return content_type.startswith("text/") or "javascript" in content_type or "json" in content_type

    def _serve_file(self, path: Path) -> None:
        if not path.exists() or not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content_types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".ico": "image/x-icon",
        }
        content_type = content_types.get(path.suffix.lower(), "application/octet-stream")
        stat = path.stat()
        cache_key = path.resolve()
        with self.portal.static_cache_lock:
            cached = self.portal.static_cache.get(cache_key)
            signature = (stat.st_mtime_ns, stat.st_size)
            if not cached or cached[:2] != signature:
                body = path.read_bytes()
                compressed = gzip.compress(body, compresslevel=5) if len(body) >= 1400 and self._compressible(content_type) else None
                cached = (signature[0], signature[1], content_type, body, compressed)
                self.portal.static_cache[cache_key] = cached
        _, _, content_type, raw_body, gzip_body = cached
        accepts_gzip = "gzip" in self.headers.get("Accept-Encoding", "").lower()
        body = gzip_body if accepts_gzip and gzip_body is not None else raw_body
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self._security_headers()
        if gzip_body is not None:
            self.send_header("Vary", "Accept-Encoding")
        if body is gzip_body:
            self.send_header("Content-Encoding", "gzip")
        name = path.name
        if name.startswith("guide-") or name == "guide.css":
            # Guide assets keep stable filenames and change between releases; always revalidate.
            self.send_header("Cache-Control", "no-cache")
        elif path.suffix.lower() in {".js", ".css"} and any(char.isdigit() for char in name):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        elif path.suffix.lower() == ".html":
            self.send_header("Cache-Control", "no-cache")
        else:
            self.send_header("Cache-Control", "public, max-age=3600")
        self.end_headers()
        self.wfile.write(body)

    def _redirect(self, location: str, cookies: list[str] | None = None) -> None:
        self.send_response(HTTPStatus.SEE_OTHER)
        self.send_header("Location", location)
        self.send_header("Cache-Control", "no-store")
        self._security_headers()
        for cookie in cookies or []:
            self.send_header("Set-Cookie", cookie)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _json(
        self,
        payload: dict[str, Any],
        status: HTTPStatus = HTTPStatus.OK,
        extra_headers: list[tuple[str, str]] | None = None,
    ) -> None:
        raw_body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        accepts_gzip = "gzip" in self.headers.get("Accept-Encoding", "").lower()
        compressed = len(raw_body) >= 1400 and accepts_gzip
        body = gzip.compress(raw_body, compresslevel=DYNAMIC_GZIP_LEVEL) if compressed else raw_body
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self._security_headers()
        for name, value in extra_headers or []:
            self.send_header(name, value)
        if compressed:
            self.send_header("Content-Encoding", "gzip")
            self.send_header("Vary", "Accept-Encoding")
        self.end_headers()
        self.wfile.write(body)


def resolve_hosted_db_path() -> str:
    explicit = os.getenv("HOSTED_PORTAL_DB", "").strip()
    return explicit or "crystal_guild_hosted.db"


def run_hosted_server(
    host: str,
    port: int,
    database_path: str,
    static_dir: str | Path,
    sync_key: str,
) -> None:
    if not sync_key:
        raise RuntimeError("PORTAL_SYNC_KEY is required for the hosted portal.")
    store = HostedPortalStore(database_path)
    oauth_config = TwitchOAuthConfig.from_env()
    actions_raw = os.getenv("PORTAL_ACTIONS_ENABLED", "1").strip().lower()
    actions_enabled = actions_raw not in {"0", "false", "no", "off"}
    server = HostedPortalHTTPServer(
        (host, port),
        HostedPortalHandler,
        store,
        Path(static_dir),
        sync_key,
        oauth_config=oauth_config,
        actions_enabled=actions_enabled,
    )
    print(f"Crystal Guild hosted portal v{HOSTED_PORTAL_VERSION}")
    print(f"Twitch player login: {'configured' if oauth_config.enabled else 'disabled'}")
    print(f"Portal action relay: {'enabled' if actions_enabled else 'disabled'}")
    print(f"Listening on http://{host}:{port}")
    print(f"Storage: {Path(database_path).resolve()}")
    try:
        server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        pass
    finally:
        server.shutdown()
        server.server_close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Crystal Guild hosted Adventurer Portal")
    parser.add_argument("--host", default=os.getenv("HOSTED_PORTAL_HOST", "0.0.0.0"))
    parser.add_argument("--port", type=int, default=int(os.getenv("PORT", os.getenv("HOSTED_PORTAL_PORT", "8080"))))
    parser.add_argument("--database", default=resolve_hosted_db_path())
    parser.add_argument("--static", default=os.getenv("HOSTED_PORTAL_STATIC_DIR", "frontend/dist"))
    args = parser.parse_args()
    run_hosted_server(
        args.host,
        args.port,
        args.database,
        args.static,
        os.getenv("PORTAL_SYNC_KEY", ""),
    )


if __name__ == "__main__":
    main()
