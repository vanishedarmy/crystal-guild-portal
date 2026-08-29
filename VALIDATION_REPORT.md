# Crystal Guild v1.4.0 — Dungeons & Delves Alpha 2 Web Hotfix 1 Validation Report

## Result
**PASS**

## Automated suites
- Frontend Node regression suite: **378 / 378 PASS**.
- Hosted Web/API Python unittest suite: **47 / 47 PASS**.
- Compatible Bot remains unchanged at the Alpha 2 shipping baseline.

## Source validation
- Hosted Web Python compile sweep: **8 / 8 PASS**.
- Frontend JS/JSX/MJS TypeScript-parser sweep: **191 / 191 PASS**.
- Plain JS/MJS `node --check`: **151 / 151 PASS**.
- Literal frontend image-route audit: **159 routes / 0 missing**.
- Public artwork state: **0 PNG / 576 WebP**.

## Focused Hotfix 1 coverage
- Dungeon Board renders the shared `section-collapse-button` rather than the oversized local generic control.
- Shared board button remains a **38px** box with the canonical shared pointer icon sizing.
- `CollapsePointer` continues to choose right-hand art when closed and down-hand art when open.
- Dungeon Board contains a real `<img class="dungeon-board-background-art">` using `/retro-phase-iii/scene-backgrounds-v4/dungeon_board.webp`.
- Background art is positioned independently beneath the board content; global `.panel` background rules cannot suppress it.
- New Dungeon Board WebP is **2172×724 / 183,336 bytes**; the 1,964,168-byte PNG source is not shipped.

## Continuity
- Hosted Web runtime: `1.4.0-dungeons-a2` unchanged.
- Frontend asset revision: `1.4.0-dungeons-a2-h1`.
- Compatible Bot: `1.4.0-dungeons-a2` unchanged.
- Local DB schema **10**, hosted sync schema **1**, Portal Action protocol **24**, Twitch prefix `!` unchanged.
- No Bot update, DB migration, reset, OAuth/environment, gameplay/economy/balance change.

## Package verification
- Alpha 2 → Web Hotfix 1 patch: **40 changed/new files, 0 deletions**.
- Baseline Web tree: **818 files**.
- Final Web tree: **820 files**.
- Full Web ZIP CRC/integrity: **PASS**.
- Patch ZIP CRC/integrity: **PASS**.
- A2 patch reconstruction: **820 / 820 exact files PASS**.
- Runtime/private-artifact hygiene: **0 violations**.

