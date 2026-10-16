"""Original Guild QB roster; complete launch roster with solo unlock paths."""
import json
from pathlib import Path

CATALOG = json.loads(Path(__file__).with_name("queens_blood_catalog.json").read_text(encoding="utf-8"))
COLLECTION = {c["id"]: c for c in CATALOG["cards"]}
PLAYABLE = {id: c for id, c in COLLECTION.items() if c["enabled"]}
OPPONENTS = {o["id"]: o for o in CATALOG["opponents"]}
STARTER = CATALOG["starter_deck"]


def validate_catalog():
    if len(COLLECTION) != 48 or len(PLAYABLE) != 48:
        raise ValueError("Invalid Card Hall roster.")
    rewards = [id for o in OPPONENTS.values() for id in o["rewards"]]
    if len(rewards) != len(set(rewards)) or set(rewards) | set(STARTER) != set(PLAYABLE):
        raise ValueError("Every playable card requires exactly one solo unlock path.")
    for c in PLAYABLE.values():
        if not (type(c["rank"]) is int and 1 <= c["rank"] <= 3 or c["rank"] == "Replace") or type(c["power"]) is not int or c["power"] < 1:
            raise ValueError("Invalid playable rank or power.")
        if c["effect"] not in {None, "played", "aura", "destroyed", "inherit", "threshold", "count"}:
            raise ValueError("Unsupported effect in playable catalog.")
        if c["effect"] == "threshold" and (type(c.get("threshold")) is not int or c["threshold"] <= c["power"] or c.get("target") != "ally" or type(c.get("amount")) is not int or c["amount"] <= 0):
            raise ValueError("Invalid threshold ability.")
        if c["effect"] == "count" and (c.get("count_status") not in {"enhanced", "enfeebled"} or c.get("target") not in {"ally", "enemy"} or type(c.get("amount")) is not int or c["amount"] <= 0):
            raise ValueError("Invalid count ability.")
    for deck in [STARTER, *[p["cards"] for p in CATALOG["presets"]], *[o["deck"] for o in OPPONENTS.values()]]:
        if len(deck) != 15 or any(id not in PLAYABLE or deck.count(id) > PLAYABLE[id]["copy_limit"] for id in deck):
            raise ValueError("Invalid catalog deck.")


validate_catalog()
