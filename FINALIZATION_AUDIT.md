# Crystal Guild v1.4.0 — Dungeons & Delves Beta 2 Release Audit

## Release identity
- Compatible Bot runtime: `1.4.0-dungeons-b1` — unchanged
- Hosted Web runtime: `1.4.0-dungeons-b2`
- Frontend asset revision: `1.4.0-dungeons-b2`
- Local DB schema: **10**
- Hosted sync schema: **1**
- Portal Action protocol: **25**
- Twitch prefix: `!`

## Scope lock
Beta 2 is a Web-only Dungeon UX/mobile consolidation pass. The catalog remains exactly four delves. No fifth Dungeon, new currency, progression layer, reward tuning, combat tuning, or authoritative state-contract change is included.

## Continuity
- Beta 1 exact run/chamber/revision binding remains the authoritative Portal mutation contract.
- Replay/idempotency, restart/reconnect persistence, route modifiers, Event outcomes, first-clear rewards, settlement ratios, and completed records are unchanged.
- The Dungeon Board retains the existing optimized artwork and shared pointer controls.
- Shipping archives must contain no `.env`, live database, token JSON, cache, log, or other runtime-private state.

## Upgrade contract
- Beta 1 → Beta 2: **Web-only**.
- No DB migration and no Portal Action protocol change.
- Keep the Beta 1 Bot running; deploy/restart only the Web service.
- No player reset, OAuth change, or new environment variable.
