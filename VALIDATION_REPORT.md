# Crystal Guild v1.4.0 — Dungeons & Delves Beta 2 Validation Report

## Result
**PASS**

## Automated suites
- Frontend Node regression suite: **389 / 389 PASS**.
- Hosted Web/API Python unittest suite: **47 / 47 PASS**.
- Compatible Beta 1 Bot remains unchanged at its shipping baseline: **522 / 522 PASS**.

## Beta 2 UX/mobile coverage
- Active delve view exposes chamber progress, Dungeon identity, current state, and retreat value in one run-status group.
- Carried Cache is separated and explicitly labeled as at-risk until the delve ends.
- Crossroads consequences use individual scannable effect chips.
- Result reports expose the exact Cache settlement rate and outcome explanation.
- Clear / retreat / defeat settlement remains **100% / 50% / 25%** with no balance change.
- Dungeon cards consolidate level, length, choices/events, and personal record.
- Mobile Dungeon battle commands use a two-column action grid; route choices and cards collapse cleanly for narrow screens.
- Beta 1 run/chamber/revision stale-tab binding remains present in the Web action payloads and regression suite.

## Source / asset validation
- Hosted Web Python compile sweep: **8 / 8 PASS**.
- Frontend JS/JSX/MJS TypeScript-parser sweep: **195 / 195 PASS**.
- Plain JS/MJS `node --check`: **155 / 155 PASS**.
- Quoted literal image-route audit: **226 routes / 0 missing**.
- Public artwork remains **0 PNG / 576 WebP**.
- No new artwork is added in Beta 2.

## Payload / compatibility continuity
- The authoritative Adventure-state data contract is unchanged from Beta 1; the all-four-Dungeon payload remains **15,368 bytes**, leaving **1,016 bytes** below the 16 KiB guardrail.
- Compatible Bot runtime: `1.4.0-dungeons-b1`.
- Hosted Web/frontend: `1.4.0-dungeons-b2`.
- Local DB schema **10**, hosted sync schema **1**, Portal Action protocol **25**, Twitch prefix `!`.
- No Bot update, DB migration, player reset, OAuth/environment change, or gameplay/economy/balance change.

## Patch/package verification
- Beta 1 → Beta 2 Web patch: **55 changed/new files, 0 deletions**.
- Patch helper reconstructs **823 / 823** final Web shipping files exactly.
- Full Web and patch ZIP CRC/integrity: **PASS**.
- Runtime/private-artifact hygiene: **0 violations**.
- SHA-256 verification: **PASS**.
