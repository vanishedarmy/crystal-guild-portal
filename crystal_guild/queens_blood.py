"""QB-1: pure core rules shared by tutorial, practice and future match modes.

Enfeeblement, destruction and replacement are supported for new matches.
Older saved matches retain their original placement rules.
Crystal Guild draw/mulligan policy is versioned; persisted rule identifiers are retained for compatibility.
"""
from __future__ import annotations

import copy
import random
import uuid
from .queens_blood_catalog import PLAYABLE, CATALOG

LEGACY_RULES_VERSION = "qb-core-prototype-1"
ADVANCED_RULES_VERSION = "qb-advanced-prototype-2"
RULES_VERSION = "qb-complete-prototype-3"
SUPPORTED_RULES = {LEGACY_RULES_VERSION, ADVANCED_RULES_VERSION, RULES_VERSION}
PATTERNS = {
    "C1": [(0, 1)], "C2": [(0, 1), (-1, 0)],
    "C3": [(0, 1), (1, 0)], "C4": [(0, 1), (-1, 0), (1, 0)],
    "C5": [(-1, 1), (1, 1)], "C6": [(0, 1), (0, 2)],
    "C7": [(-1, 0), (1, 0)], "C12": [(0, 2), (-1, 0), (1, 0)],
}


def _card(id, name, rank, power, pattern, reference, symbol, effect=None):
    return {"id": id, "name": name, "rank": rank, "power": power,
            "claim": PATTERNS[pattern], "reference": reference, "symbol": symbol,
            "effect": effect, "rules": (
                "While present: allied cards above and below gain 1 power."
                if effect == "aura" else
                "When played: allied cards above and below gain 1 power."
                if effect == "played" else "No special ability; expand your territory.")}


CARDS = {c["id"]: c for c in [
    _card("QB001", "Chocobo", 1, 2, "C4", "Final Fantasy series", "♞"),
    _card("QB002", "Moogle", 1, 1, "C2", "Final Fantasy series", "✧", "aura"),
    _card("QB003", "Goblin", 1, 2, "C3", "Final Fantasy I", "◆"),
    _card("QB004", "Mandragora", 1, 1, "C5", "Final Fantasy XI", "❋"),
    _card("QB009", "White Mage", 1, 1, "C3", "Final Fantasy III", "✚", "played"),
    _card("QB011", "Dragoon", 2, 3, "C12", "Final Fantasy IV", "⚔"),
    _card("QB012", "Magitek Armor", 2, 4, "C6", "Final Fantasy VI", "▣"),
    _card("QB013", "Shinra Trooper", 1, 2, "C6", "Final Fantasy VII", "▥"),
    _card("QB015", "Behemoth", 3, 7, "C4", "Final Fantasy series", "♜"),
]}
LEGACY_CARDS = copy.deepcopy(CARDS)
CARDS = PLAYABLE

def catalog_for(state):
    return state.get("card_snapshot", LEGACY_CARDS)

# Prototype Frontier substitutes Moogle for the gated Black Mage identity.
DECK = ["QB001", "QB003", "QB004", "QB009", "QB013", "QB002"] * 2 + ["QB011", "QB012", "QB015"]


class RuleError(ValueError):
    pass


def _int(value, low, high, label):
    if type(value) is not int or not low <= value <= high:
        raise RuleError(f"Invalid {label}.")
    return value


def validate_deck(deck, owned=None):
    if not isinstance(deck, list) or len(deck) != 15:
        raise RuleError("A deck must contain exactly 15 cards.")
    if any(not isinstance(c, str) or c not in CARDS for c in deck):
        raise RuleError("This deck contains an unavailable card.")
    if any(deck.count(c) > CARDS[c]["copy_limit"] for c in set(deck)):
        raise RuleError("This deck exceeds a card’s copy limit.")
    if owned is not None and any(c not in owned for c in deck):
        raise RuleError("Unlock every card in this deck before saving it.")


def new_match(mode="tutorial", seed=None, player_deck=None, opponent_deck=None, opponent=None, deck_name="Frontier"):
    if not isinstance(mode, str) or mode not in {"tutorial", "practice", "circuit"}:
        raise RuleError("Choose Tutorial or Practice.")
    decks = [list(player_deck or DECK), list(opponent_deck or DECK)]
    for deck in decks:
        validate_deck(deck)
    rng = random.Random(seed)
    # Guided opening is disclosed in the UI. Practice uses private shuffled decks.
    if mode != "tutorial":
        for deck in decks:
            rng.shuffle(deck)
    state = {"id": uuid.uuid4().hex, "rules_version": RULES_VERSION,
             "mode": mode, "catalog_revision": CATALOG["revision"], "card_snapshot": copy.deepcopy(CARDS),
             "opponent_id": opponent["id"] if opponent else None, "opponent_name": opponent["name"] if opponent else "Moogle Dealer",
             "opponent_rewards": list(opponent["rewards"]) if opponent else [],
             "deck_name": deck_name, "revision": 0, "phase": "mulligan", "turn": 0,
             "ply": 0, "passes": 0, "winner": None, "reason": None,
             "hands": [d[:5] for d in decks], "decks": [d[5:] for d in decks],
             "board": [], "log": [], "mulligan_seed": rng.getrandbits(64)}
    for row in range(3):
        state["board"].append([
            {"owner": 0 if col == 0 else 1 if col == 4 else None,
             "rank": 1 if col in (0, 4) else 0, "card": None, "bonus": 0}
            for col in range(5)])
    return state


def affected(row, col, side, offsets):
    return [(row + dr, col + dc * (1 if side == 0 else -1))
            for dr, dc in offsets
            if 0 <= row + dr < 3 and 0 <= col + dc * (1 if side == 0 else -1) < 5]


def _base_powers(state):
    values = [[0] * 5 for _ in range(3)]
    for r, row in enumerate(state["board"]):
        for c, tile in enumerate(row):
            if tile["card"]:
                values[r][c] = catalog_for(state)[tile["card"]]["power"] + tile["bonus"]
    for r, row in enumerate(state["board"]):
        for c, tile in enumerate(row):
            if tile["card"] and catalog_for(state)[tile["card"]]["effect"] == "aura":
                for rr, cc in affected(r, c, tile["owner"], catalog_for(state)[tile["card"]].get("effect_offsets", [(-1, 0), (1, 0)])):
                    target = state["board"][rr][cc]
                    if target["card"] and _matches_target(tile["owner"], target["owner"], catalog_for(state)[tile["card"]].get("target", "ally")):
                        values[rr][cc] += catalog_for(state)[tile["card"]].get("amount", 1)
    return values


def card_statuses(state):
    """Net external modifiers; own scaling and inherited printed power are intrinsic.

    This nonrecursive classification prevents two count cards from granting each
    other a bonus without a real enhancement source.
    """
    base = _base_powers(state)
    statuses = [[None] * 5 for _ in range(3)]
    for r, row in enumerate(state["board"]):
        for c, tile in enumerate(row):
            if tile["card"]:
                external = base[r][c] - catalog_for(state)[tile["card"]]["power"] - tile.get("inherited", 0)
                statuses[r][c] = "enhanced" if external > 0 else "enfeebled" if external < 0 else "normal"
    return statuses


def powers(state):
    values = _base_powers(state)
    if state.get("rules_version") != RULES_VERSION:
        return values
    statuses = card_statuses(state)
    for r, row in enumerate(state["board"]):
        for c, tile in enumerate(row):
            if not tile["card"]: continue
            card = catalog_for(state)[tile["card"]]
            if card.get("effect") == "count":
                count = sum(1 for rr, targets in enumerate(state["board"]) for cc, target in enumerate(targets)
                    if (rr, cc) != (r, c) and target["card"] and
                    _matches_target(tile["owner"], target["owner"], card["target"]) and
                    statuses[rr][cc] == card["count_status"])
                values[r][c] += card["amount"] * count
    return values


def _public_board(state):
    power = powers(state)
    status = card_statuses(state) if state.get("rules_version") == RULES_VERSION else None
    return [[dict(tile, power=power[r][c], **({"status": status[r][c]} if status else {}))
             for c, tile in enumerate(row)] for r, row in enumerate(state["board"])]


def scores(state):
    power = powers(state)
    lanes, totals = [], [0, 0]
    for r, row in enumerate(state["board"]):
        raw = [sum(power[r][c] for c, tile in enumerate(row)
                   if tile["card"] and tile["owner"] == side) for side in (0, 1)]
        awarded = [raw[0] if raw[0] > raw[1] else 0,
                   raw[1] if raw[1] > raw[0] else 0]
        lanes.append({"power": raw, "awarded": awarded})
        totals = [totals[i] + awarded[i] for i in (0, 1)]
    return {"lanes": lanes, "totals": totals}


def legal_moves(state, side=None):
    side = state["turn"] if side is None else side
    if state["phase"] != "play":
        return []
    moves = []
    for index, card in enumerate(state["hands"][side]):
        for r, row in enumerate(state["board"]):
            for c, tile in enumerate(row):
                definition = catalog_for(state)[card]
                fits = bool(tile["card"]) if definition["rank"] == "Replace" else not tile["card"] and tile["rank"] >= definition["rank"]
                if tile["owner"] == side and fits:
                    moves.append({"kind": "play", "hand": index, "row": r, "col": c})
    return moves


def _place_legacy(state, side, index, row, col):
    card_id = state["hands"][side].pop(index)
    card = catalog_for(state)[card_id]
    tile = state["board"][row][col]
    tile.update(card=card_id, bonus=0)
    claimed = affected(row, col, side, card["claim"])
    for rr, cc in claimed:
        target = state["board"][rr][cc]
        if target["card"]:
            continue
        if target["owner"] is None:
            target.update(owner=side, rank=1)
        elif target["owner"] == side:
            target["rank"] = min(3, target["rank"] + 1)
        else:
            target["owner"] = side
    if card["effect"] == "played":
        for rr, cc in affected(row, col, side, card.get("effect_offsets", [(-1, 0), (1, 0)])):
            target = state["board"][rr][cc]
            if target["card"] and target["owner"] == side:
                target["bonus"] += card.get("amount", 1)
    state["log"].append(f"{'You' if side == 0 else state.get('opponent_name', 'Moogle Dealer')} played {card['name']} in lane {row + 1}, column {col + 1}.")
    return claimed


def _matches_target(source_side, target_side, target):
    return target == "all" or target == "ally" and source_side == target_side or target == "enemy" and source_side != target_side


def _effect(state, card, side, row, col):
    for rr, cc in affected(row, col, side, card.get("effect_offsets", [])):
        target = state["board"][rr][cc]
        if target["card"] and _matches_target(side, target["owner"], card.get("target", "ally")):
            target["bonus"] += card.get("amount", 0)
            state["events"].append({"kind": "enfeebled" if card.get("amount", 0) < 0 else "enhanced",
                "card": target["card"], "source": card["id"], "row": rr, "col": cc, "amount": card.get("amount", 0)})


def _remove(state, row, col, kind="destroyed"):
    tile = state["board"][row][col]
    card = catalog_for(state)[tile["card"]]
    side = tile["owner"]
    state["events"].append({"kind": kind, "card": card["id"], "row": row, "col": col})
    # Destruction leaves a rank-one position for its previous controller.
    tile.update(card=None, bonus=0, rank=1)
    if state.get("rules_version") == RULES_VERSION: tile.update(inherited=0, threshold_fired=False)
    return card, side, row, col


def _resolve(state, queue=None):
    queue = list(queue or [])
    complete = state.get("rules_version") == RULES_VERSION
    # At most 15 removals and 15 once-only threshold firings; both terminate.
    for _ in range(32 if complete else 16):
        for card, side, row, col in queue:
            if card.get("effect") == "destroyed": _effect(state, card, side, row, col)
        queue = []
        power = powers(state)
        fallen = [(r, c) for r, row in enumerate(state["board"]) for c, t in enumerate(row) if t["card"] and power[r][c] <= 0]
        if fallen:
            queue = [_remove(state, r, c) for r, c in fallen]
            continue
        ready = []
        if complete:
            for r, row in enumerate(state["board"]):
                for c, tile in enumerate(row):
                    if not tile["card"] or tile.get("threshold_fired"): continue
                    card = catalog_for(state)[tile["card"]]
                    if card.get("effect") == "threshold" and power[r][c] >= card["threshold"]:
                        ready.append((card, tile["owner"], r, c))
        if not ready: return
        # Mark the whole ready group before applying any boost to other cards.
        for card, side, r, c in ready:
            state["board"][r][c]["threshold_fired"] = True
            state["events"].append({"kind": "threshold", "card": card["id"], "row": r, "col": c, "threshold": card["threshold"]})
        for card, side, r, c in ready: _effect(state, card, side, r, c)
    raise RuleError("Ability resolution exceeded the board limit.")


def _place(state, side, index, row, col):
    if state.get("rules_version") == LEGACY_RULES_VERSION:
        return _place_legacy(state, side, index, row, col)
    previous_power = powers(state)
    previous_base = _base_powers(state)
    previous_cards = [[tile["card"] for tile in row] for row in state["board"]]
    state["events"] = []
    card_id = state["hands"][side].pop(index)
    card = catalog_for(state)[card_id]
    tile = state["board"][row][col]
    old = catalog_for(state)[tile["card"]] if tile["card"] else None
    queue = [_remove(state, row, col, "replaced")] if old else []
    tile.update(card=card_id, bonus=old["power"] if old and card.get("inherit_printed") else 0)
    if state.get("rules_version") == RULES_VERSION:
        tile.update(inherited=old["power"] if old and card.get("inherit_printed") else 0, threshold_fired=False)
    if old: state["events"].append({"kind": "replacement", "card": card_id, "row": row, "col": col})
    # The removed card's destruction trigger resolves before the new played ability.
    _resolve(state, queue)
    if tile["card"] == card_id and card.get("effect") == "played": _effect(state, card, side, row, col)
    _resolve(state)
    claimed = affected(row, col, side, card["claim"])
    # Claim after effects so a newly emptied affected position can be claimed.
    for rr, cc in claimed:
        target = state["board"][rr][cc]
        if target["card"]: continue
        if target["owner"] is None: target.update(owner=side, rank=1)
        elif target["owner"] == side: target["rank"] = min(3, target["rank"] + 1)
        else: target["owner"] = side
    if state.get("rules_version") == RULES_VERSION:
        final_power = powers(state); final_base = _base_powers(state)
        for r, tiles in enumerate(state["board"]):
            for c, target in enumerate(tiles):
                if target["card"] and catalog_for(state)[target["card"]].get("effect") == "count":
                    old_count = previous_power[r][c] - previous_base[r][c] if previous_cards[r][c] == target["card"] else 0
                    delta = final_power[r][c] - final_base[r][c] - old_count
                    if delta: state["events"].append({"kind": "scaling", "card": target["card"], "row": r, "col": c, "amount": delta})
    actor = state["players"][side]["username"] if "players" in state else "You" if side == 0 else state.get("opponent_name", "Moogle Dealer")
    state["log"].append(f"{actor} played {card['name']} in lane {row + 1}, column {col + 1}.")
    return claimed


def apply_action(state, side, action):
    """Return a new state; rejected actions never mutate the caller's state."""
    if state.get("rules_version") not in SUPPORTED_RULES:
        raise RuleError("This match uses an unsupported rules version.")
    if side not in (0, 1) or type(side) is not int or not isinstance(action, dict):
        raise RuleError("Invalid action.")
    kind = action.get("kind")
    if not isinstance(kind, str):
        raise RuleError("Invalid action kind.")
    if state["phase"] == "finished":
        raise RuleError("This match has finished.")
    result = copy.deepcopy(state)
    result["events"] = []
    if kind == "resign" and set(action) == {"kind"}:
        if side != state["turn"]:
            raise RuleError("It is not your turn.")
        result.update(phase="finished", reason="resigned", winner=1 - side)
        result["revision"] += 1
        result["log"].append(f"{'You' if side == 0 else state.get('opponent_name', 'Moogle Dealer')} resigned.")
        return result
    if state["phase"] == "mulligan":
        if side != 0 or kind != "mulligan" or set(action) != {"kind", "indices"}:
            raise RuleError("Confirm the opening hand before playing.")
        indices = action["indices"]
        if not isinstance(indices, list) or len(indices) > 5:
            raise RuleError("Invalid opening exchange.")
        for index in indices:
            _int(index, 0, 4, "hand index")
        if len(set(indices)) != len(indices):
            raise RuleError("Select each opening card only once.")
        returned = [result["hands"][0][i] for i in indices]
        for index in indices:
            result["hands"][0][index] = result["decks"][0].pop(0)
        if returned:
            result["decks"][0].extend(returned)
            random.Random(result["mulligan_seed"]).shuffle(result["decks"][0])
        result["phase"] = "play"
        result["log"].append(f"Opening hand confirmed; {len(indices)} card(s) exchanged.")
    else:
        if side != state["turn"]:
            raise RuleError("It is not your turn.")
        if kind == "play":
            if set(action) != {"kind", "hand", "row", "col"}:
                raise RuleError("Invalid placement fields.")
            _int(action["hand"], 0, len(state["hands"][side]) - 1, "hand index")
            _int(action["row"], 0, 2, "lane")
            _int(action["col"], 0, 4, "column")
            if action not in legal_moves(state, side):
                raise RuleError("Choose a legal controlled position: enough pawns, or an allied card for replacement.")
            _place(result, side, action["hand"], action["row"], action["col"])
            result["passes"] = 0
        elif kind in {"pass", "resign"} and set(action) == {"kind"}:
            result["log"].append(f"{'You' if side == 0 else state.get('opponent_name', 'Moogle Dealer')} {'passed' if kind == 'pass' else 'resigned'}.")
            result["passes"] += 1
        else:
            raise RuleError("Invalid move.")
        if kind == "resign" or result["passes"] == 2:
            totals = scores(result)["totals"]
            result.update(phase="finished", reason="resigned" if kind == "resign" else "two_passes",
                          winner=1 - side if kind == "resign" else
                          None if totals[0] == totals[1] else 0 if totals[0] > totals[1] else 1)
        else:
            result["turn"] = 1 - side
            result["ply"] += 1
            next_side = result["turn"]
            if result["decks"][next_side]:
                result["hands"][next_side].append(result["decks"][next_side].pop(0))
    result["revision"] += 1
    result["log"] = result["log"][-40:]
    return result


def ai_move(state):
    """Greedy beginner AI: uses its own hand and public board, never enemy hand."""
    moves = legal_moves(state, 1)
    if not moves:
        return {"kind": "pass"}
    def value(move):
        trial = copy.deepcopy(state)
        _place(trial, 1, move["hand"], move["row"], move["col"])
        score = scores(trial)
        territory = sum(t["rank"] for row in trial["board"] for t in row
                        if t["owner"] == 1 and not t["card"])
        return score["totals"][1] - score["totals"][0] + territory * .65
    return max(moves, key=value)


def public_match(state):
    if state is None:
        return None
    payload = {key: copy.deepcopy(state[key]) for key in
               ("id", "rules_version", "mode", "revision", "phase", "turn", "ply", "passes", "winner", "reason", "board", "log")}
    payload["events"] = copy.deepcopy(state.get("events", []))
    payload.update(opponent_name=state.get("opponent_name", "Moogle Dealer"), opponent_id=state.get("opponent_id"), deck_name=state.get("deck_name", "Frontier"), catalog_revision=state.get("catalog_revision", 1), reward_cards=state.get("reward_cards", []))
    payload["board"] = _public_board(state)
    payload.update(hand=state["hands"][0].copy(), opponent_hand_count=len(state["hands"][1]),
                   deck_counts=[len(d) for d in state["decks"]], scores=scores(state), legal=[])
    if state["turn"] == 0 and state["phase"] == "play":
        for move in legal_moves(state, 0):
            trial = copy.deepcopy(state)
            claims = _place(trial, 0, move["hand"], move["row"], move["col"])
            preview_board = _public_board(trial)
            payload["legal"].append({**move, "claims": claims, "board": preview_board, "events": copy.deepcopy(trial.get("events", [])),
                                     "scores": scores(trial), "powers": powers(trial),
                                     "territory": [{"row": rr, "col": cc, "owner": trial["board"][rr][cc]["owner"],
                                                    "rank": trial["board"][rr][cc]["rank"]}
                                                   for rr, cc in claims if not trial["board"][rr][cc]["card"]]})
    return payload
