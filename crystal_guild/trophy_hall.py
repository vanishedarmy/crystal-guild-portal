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

    # The Bot already seals unearned secrets, but do not let a stale/partial
    # hosted snapshot accidentally forward names, artwork or private event
    # evidence to a different player's Hall. Ownership must agree with the
    # independent durable receipt list before revealing a Moment trophy.
    moment_slots: list[dict[str, Any]] = []
    for position, raw in enumerate(trophies.get("moment_slots") or [], start=1):
        slot = raw if isinstance(raw, dict) else {}
        trophy_id = str(slot.get("id") or "")
        if slot.get("earned") is True and trophy_id.startswith("moment_trophy_") and trophy_id in seen:
            moment_slots.append({
                "id": trophy_id,
                "name": slot.get("name"), "description": slot.get("description"),
                "category": slot.get("category"), "requirement": slot.get("requirement"),
                "art": slot.get("art"), "locked_art": slot.get("locked_art"),
                "secret": True, "earned": True,
            })
        else:
            moment_slots.append({
                "id": f"sealed_trophy_slot_{position:02d}",
                "name": "Undiscovered Trophy", "description": "Its story has yet to be written.",
                "category": "mystery", "requirement": None, "art": None, "locked_art": None,
                "secret": True, "earned": False,
            })

    return {
        "player": {
            "username": identity.get("username"),
            "display_name": identity.get("display_name"),
            "level": int(identity.get("level") or 0),
            "title": identity.get("title"),
        },
        "unlocked": unlocked,
        "moment_slots": moment_slots,
        "summary": {"unlocked": len(unlocked), "total": 30 + len(moment_slots)},
    }
