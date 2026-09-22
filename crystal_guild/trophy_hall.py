from __future__ import annotations

from typing import Any


def build_trophy_hall(snapshot: dict[str, Any]) -> dict[str, Any]:
    """Return the compact, authoritative Hall of Trophies player state.

    The trophy catalog and artwork ship with the matching frontend build. The
    hosted payload only needs the player's permanent ownership records.
    """
    overview = snapshot.get("overview") or {}
    identity = overview.get("identity") or {}
    trophies = snapshot.get("trophies") or {}

    unlocked: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in trophies.get("unlocked") or []:
        trophy_id = str(item.get("id") or "").strip()
        if not trophy_id or trophy_id in seen:
            continue
        seen.add(trophy_id)
        unlocked.append(
            {
                "id": trophy_id,
                "unlock_source": item.get("unlock_source"),
                "unlocked_at": item.get("unlocked_at"),
                "seen_at": item.get("seen_at"),
            }
        )

    return {
        "player": {
            "username": identity.get("username"),
            "display_name": identity.get("display_name"),
            "level": int(identity.get("level") or 0),
            "title": identity.get("title"),
        },
        "unlocked": unlocked,
        "summary": {"unlocked": len(unlocked), "total": 30},
    }
