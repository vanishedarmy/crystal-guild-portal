# Crystal Guild v1.4.0 — Dungeons & Delves Beta 3 Release Audit

## Release identity
- Bot runtime: `1.4.0-dungeons-b3`
- Hosted Web runtime: `1.4.0-dungeons-b3`
- Frontend asset revision: `1.4.0-dungeons-b3`
- Local DB schema: **10**
- Hosted sync schema: **1**
- Portal Action protocol: **25**
- Twitch prefix: `!`

## Scope lock
Beta 3 is a stability/hardening build. The four-Dungeon catalog and Beta 2 UX are frozen. No new Dungeon, currency, progression layer, reward/combat tuning, or non-Dungeon balance change is included.

## Reliability / UI closure
- Matching Bot obtains write intent before authoritative state validation so separate connections serialize Dungeon mutations.
- Exact run/chamber/revision and action-ID replay contracts remain intact.
- Mobile Dungeon Board disclosure is pinned to the right edge and preserves right-closed/down-open state.
- Player Guide exposes player-safe stale-tab recovery guidance.
- Shipping archives must contain no `.env`, live database, tokens, logs, caches, or runtime-private state.

## Upgrade contract
- Expected baseline: Beta 2 Web + Beta 1 Bot.
- Schema remains **10** and Portal Action protocol remains **25**.
- Deploy Beta 3 Web + Bot together.
- No player reset, OAuth change, or new environment variable.

## Release packaging
- Bot patch baseline: Beta 1 Bot; **17 changed/new, 0 deletions**; exact **153-file** reconstruction.
- Web patch baseline: Beta 2 Web; **56 changed/new, 0 deletions**; exact **824-file** reconstruction.
- Individual and paired patch helpers: **PASS**.
- Six release ZIPs: CRC/integrity **PASS**.
- Runtime/private-artifact hygiene: **0 violations**.
- SHA-256 set: **PASS**.
