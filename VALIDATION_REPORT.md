# Validation Report — Gold Saucer Alpha 4 Web Hotfix 1
## Chocobo Racing Artwork & UI Pass

## Result
**PASS**

## Regression suites
- Frontend: **494 / 494 PASS**.
- Hosted Web/API: **53 / 53 PASS**.
- Alpha 4 Bot gameplay contract: unchanged from the canonical **623 / 623 PASS** Alpha 4 baseline.

## Source gates
- Frontend JS/JSX/MJS TypeScript-parser sweep: **223 / 223 PASS**.
- Plain JS/MJS Node syntax: **181 / 181 PASS**.
- Python parse: **11 / 11 PASS**.
- CSS parse: **8 / 8 PASS**.

## Artwork gates
- Public artwork: **0 PNG / 701 WebP**.
- WebP decode: **701 / 701 PASS**.
- New Chocobo Racing family: **9 / 9 WebP present and decodable**.
- New active asset root: `/gold-saucer/a4h1/chocobo-racing/`.
- New Racing art payload: **2,446,686 bytes** total before ZIP compression.

## UI coverage
- Dedicated race hero scene.
- Three illustrated course cards with locked/selected states.
- Three illustrated pace cards with explicit `aria-pressed` selection state.
- Last-race visual result with first-place victory art and neutral race-complete art for other placements.
- Selected-entry summary with consolidated Race Now action.
- Responsive desktop/tablet/mobile layouts and reduced-motion handling.

## Production frontend build gate
`npm run build` was attempted. This source package does not contain installed frontend dependencies, so the pinned local Vite executable is unavailable (`vite: not found`). No local Vite production-build pass is claimed; normal Render/Docker deployment installs the pinned dependencies before compilation.

## Frozen contract
Hosted runtime `1.6.0-gold-saucer-a4`; frontend asset revision `1.6.0-gold-saucer-a4h1`; compatible Bot `1.6.0-gold-saucer-a4`; local DB schema **12**; hosted sync **1**; Portal Action protocol **28**; prefix `!`; MGP remains canonical. No gameplay or economy change.
