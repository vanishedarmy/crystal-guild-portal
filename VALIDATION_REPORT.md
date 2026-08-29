# Validation Report — Crystal Guild v1.2.0 Expeditions Beta 2 Hotfix 2

## Result
**PASS — portrait scenic-background fit and duplicate-airship cleanup validated.**

## Automated validation
- Frontend Node regression suite: **316 / 316 PASS**.
- Hosted Web/API Python suite: **47 / 47 PASS**.
- Compatible Beta 1 Bot suite: **437 / 437 PASS**.
- Python compilation: **PASS**.
- TypeScript JSX parse: **64 / 64 JS/JSX source files PASS**.
- Dedicated portrait-background / duplicate-airship regression: **PASS**.

## Hotfix coverage
- Solo Venture, Relics Arsenal, Blacksmith, Chocobo Stable, and Moogle Emporium route to the new `scene-backgrounds-v3` portrait asset set.
- All five new scenic assets are **941×1672 PNGs**.
- The portrait scenic layers span the full height of their long-form tabs with `background-size: cover` and top-centered positioning.
- Existing translucent functional cards remain above the art for text/control readability.
- Camp/Recovery keeps its established horizontal scene treatment.
- Guild Heroes keeps the page-level ambient airship but no longer paints a second airship in `.hero-intro`.
- Player Guide keeps the page-level ambient airship but no longer paints a second airship in `.hero`.
- Beta 2 Hotfix 1 fixed current-viewport dialogs remain unchanged.

## Patch / package validation
- Beta 2 Hotfix 1 → Hotfix 2 Web patch contains **24 changed/new files, 0 deletions**.
- Patch reproduction against a clean Beta 2 Hotfix 1 Web tree: **PASS — 791 final files matched exactly**.
- ZIP integrity: **PASS**.
- Runtime/secret hygiene: **PASS**; no live `.env`, token stores, SQLite runtime files, logs, bytecode, caches, or `node_modules` are packaged. Example environment templates remain included as documentation.

## Compatibility
- Public product: **v1.2.0 — Expeditions Beta 2**
- Hosted Web runtime: `1.2.0-expeditions-beta2`
- Frontend asset revision: `1.2.0-expeditions-b2h2`
- Compatible Bot runtime: `1.2.0-expeditions-b1`
- Local DB schema: **8**
- Hosted sync schema: **1**
- Portal Action protocol: **20**
- Migration/player reset: **none**
