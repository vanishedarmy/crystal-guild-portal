# Validation Report — Crystal Guild v1.2.0 Expeditions Beta 3

## Result
**PASS — Mobile & Accessibility Polish validated.**

## Automated validation
- Frontend Node regression suite: **321 / 321 PASS**.
- Hosted Web/API Python suite: **47 / 47 PASS**.
- Compatible Beta 1 Bot suite: **437 / 437 PASS**.
- Python compilation: **PASS**.
- TypeScript parser: **65 / 65 JS/JSX source files PASS**.
- PostCSS parse: **Portal, Player Guide, and Streamer CSS PASS**.
- Dedicated Beta 3 mobile/accessibility regression: **PASS**.

## Beta 3 coverage
- 44px coarse-pointer touch targets and `touch-action: manipulation`.
- Dynamic-viewport detail-dialog sizing and safe-area insets.
- Mobile form text at 16px and small-phone/landscape responsive rules.
- Profile, Moogle Emporium, and Blacksmith roving keyboard tab navigation using Arrow/Home/End.
- Explicit tabpanel labelling and visible focus treatment.
- Detail-dialog content labels and Escape close path.
- Mobile menu Escape focus return.
- `prefers-contrast: more`, `forced-colors: active`, and `prefers-reduced-motion: reduce` support across Portal, Guide, and Streamer surfaces.
- Beta 2 current-viewport detail behavior, portrait backgrounds, and duplicate-airship cleanup retained.

## Patch / package validation
- Beta 2 Hotfix 2 → Beta 3 Web patch: **36 changed/new files, 0 deletions**.
- Patch reproduction against the clean Beta 2 Hotfix 2 Web tree: **PASS — 793 final files matched exactly**.
- Runtime/secret hygiene: **PASS after packaging exclusions**; no live `.env`, token stores, SQLite runtime files, logs, bytecode, caches, or `node_modules` are included. Example environment templates remain documentation.
- A local Vite production bundle is not run because release packages intentionally omit `node_modules`; source parsing and the complete frontend regression suite are clean.

## Compatibility
- Public product: **v1.2.0 — Expeditions Beta 3**
- Hosted Web runtime: `1.2.0-expeditions-beta3`
- Frontend asset revision: `1.2.0-expeditions-b3`
- Compatible Bot runtime: `1.2.0-expeditions-b1`
- Local DB schema: **8**
- Hosted sync schema: **1**
- Portal Action protocol: **20**
- Migration/player reset: **none**
