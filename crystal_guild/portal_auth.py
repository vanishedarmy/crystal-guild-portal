from __future__ import annotations

import json
import os
import secrets
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

TWITCH_AUTHORIZE_URL = "https://id.twitch.tv/oauth2/authorize"
TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token"
TWITCH_USERS_URL = "https://api.twitch.tv/helix/users"


def safe_return_path(value: str | None, default: str = "/players") -> str:
    raw = str(value or "").strip()
    if not raw.startswith("/") or raw.startswith("//") or "\\" in raw:
        return default
    # Keep OAuth return paths on this site and out of the API/auth namespaces.
    if raw.startswith(("/api/", "/auth/")):
        return default
    return raw[:500]


@dataclass(frozen=True)
class TwitchOAuthConfig:
    client_id: str
    client_secret: str
    redirect_uri: str
    cookie_secure: bool = True
    session_ttl_seconds: int = 7 * 24 * 60 * 60
    state_ttl_seconds: int = 10 * 60

    @property
    def enabled(self) -> bool:
        return bool(self.client_id and self.client_secret and self.redirect_uri)

    @classmethod
    def from_env(cls) -> "TwitchOAuthConfig":
        client_id = os.getenv("PORTAL_TWITCH_CLIENT_ID", "").strip()
        client_secret = os.getenv("PORTAL_TWITCH_CLIENT_SECRET", "").strip()
        redirect_uri = os.getenv("PORTAL_TWITCH_REDIRECT_URI", "").strip()
        configured = [bool(client_id), bool(client_secret), bool(redirect_uri)]
        if any(configured) and not all(configured):
            raise RuntimeError(
                "Portal Twitch login is partially configured. Set PORTAL_TWITCH_CLIENT_ID, "
                "PORTAL_TWITCH_CLIENT_SECRET, and PORTAL_TWITCH_REDIRECT_URI together."
            )
        secure_raw = os.getenv("PORTAL_AUTH_COOKIE_SECURE", "1").strip().lower()
        cookie_secure = secure_raw not in {"0", "false", "no", "off"}
        return cls(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=redirect_uri,
            cookie_secure=cookie_secure,
            session_ttl_seconds=max(900, int(os.getenv("PORTAL_SESSION_TTL_SECONDS", str(7 * 24 * 60 * 60)))),
            state_ttl_seconds=max(120, int(os.getenv("PORTAL_OAUTH_STATE_TTL_SECONDS", "600"))),
        )


class TwitchOAuthClient:
    """Minimal server-side Twitch OAuth client.

    Crystal Guild uses Twitch only to prove account ownership. The returned
    Twitch access token is used once to fetch the authenticated user's identity
    and is never persisted in the hosted Portal database.
    """

    def __init__(self, config: TwitchOAuthConfig, timeout: float = 10.0):
        self.config = config
        self.timeout = max(2.0, float(timeout))

    def authorization_url(self, state: str) -> str:
        if not self.config.enabled:
            raise RuntimeError("Portal Twitch login is not configured.")
        query = urlencode(
            {
                "client_id": self.config.client_id,
                "redirect_uri": self.config.redirect_uri,
                "response_type": "code",
                # Twitch requires a scope value for authorization-code requests.
                # `openid` is the minimal identity scope and avoids asking players
                # for email, chat, follow, or channel-management permissions.
                "scope": "openid",
                "state": state,
            }
        )
        return f"{TWITCH_AUTHORIZE_URL}?{query}"

    def exchange_code(self, code: str) -> str:
        body = urlencode(
            {
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": self.config.redirect_uri,
            }
        ).encode("utf-8")
        request = Request(
            TWITCH_TOKEN_URL,
            data=body,
            method="POST",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        payload = self._json_request(request)
        token = str(payload.get("access_token") or "")
        if not token:
            raise RuntimeError("Twitch did not return an access token.")
        return token

    def fetch_user(self, access_token: str) -> dict[str, str]:
        request = Request(
            TWITCH_USERS_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Client-Id": self.config.client_id,
                "User-Agent": "CrystalGuildPortalAuth/1.0",
            },
        )
        payload = self._json_request(request)
        rows = payload.get("data")
        if not isinstance(rows, list) or not rows:
            raise RuntimeError("Twitch did not return the authenticated user.")
        row = rows[0] if isinstance(rows[0], dict) else {}
        twitch_id = str(row.get("id") or "").strip()
        login = str(row.get("login") or "").strip().lower()
        display_name = str(row.get("display_name") or login).strip()
        if not twitch_id.isdigit() or not login:
            raise RuntimeError("Twitch returned an invalid user identity.")
        return {"twitch_id": twitch_id, "login": login, "display_name": display_name}

    def authenticate_code(self, code: str) -> dict[str, str]:
        token = self.exchange_code(code)
        # Intentionally do not return or persist the Twitch token.
        return self.fetch_user(token)

    def _json_request(self, request: Request) -> dict[str, Any]:
        try:
            with urlopen(request, timeout=self.timeout) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            text = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Twitch authentication failed with HTTP {exc.code}: {text[:300]}") from exc
        except URLError as exc:
            raise RuntimeError(f"Cannot reach Twitch authentication: {exc.reason}") from exc
        if not isinstance(payload, dict):
            raise RuntimeError("Twitch returned an invalid authentication response.")
        return payload


def random_token(bytes_count: int = 32) -> str:
    return secrets.token_urlsafe(bytes_count)
