# Crystal Guild v1.9.4.7 — Seasonal Event Toggle State Fix

## What was happening

The Streamer Control Center correctly submitted the owner-only `seasonalevent on/off`
action and received the authoritative Bot result. Immediately afterward, however, the
page refreshed `/api/streamer`. That endpoint could still be backed by the previous
player snapshot for several seconds, so the fresh `enabled` state was replaced with the
older `disabled` state and the switch visibly snapped back.

The Streamer aggregate also selected seasonal state from the first player in its
level-sorted roster. Because the Seasonal Event is global rather than player-specific,
that could allow an older high-level player's mirrored snapshot to win over a newer one.

## Fix

- The hosted Portal now treats a successful Seasonal Event streamer-command result as
  the temporary authoritative global event state until a newer player sync confirms or
  supersedes it.
- `/api/streamer` now selects the freshest Seasonal Event snapshot by `synced_at`, not
  the first player by level.
- The quick Seasonal toggle and the advanced Seasonal Event command no longer force an
  immediate dashboard refresh that can race the periodic Bot-to-Web sync.
- The action result remains sanitized to the same small set of public event-control
  fields; no player token balances or private Bot data are exposed.
- The normal live-update channel still refreshes the Streamer Dashboard when the next
  mirror sync arrives.

## Deployment

This is a **Web / hosted Portal hotfix**. It does not change Seasonal Event gameplay,
encounter rates, database schema, or Bot command behavior.

Deploy the merge package over the current Crystal Guild Web root, rebuild/redeploy the
frontend as usual, and restart the hosted Web/Portal service so `hosted_portal.py` is
loaded.

The previously supplied Halloween 2026 Bot hotfix should remain installed so the live
event schedule is October 1 through November 2, 2026 and the revised Solo/Stream
seasonal encounter rates remain active.

## Validation

- Hosted Portal regression suite: **32 / 32 passed**
- Seasonal Event frontend checks: **2 / 2 passed**
- `crystal_guild/hosted_portal.py` compiles successfully
- New regression coverage verifies:
  - completed Seasonal Event commands bridge stale snapshot lag;
  - the Streamer aggregate uses the freshest mirrored Seasonal state.
