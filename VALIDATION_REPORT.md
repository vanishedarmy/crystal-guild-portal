# Validation Report — Crystal Guild v1.2.0 Expeditions Beta 2

## Result
**PASS — Beta 2 UX consolidation and compatibility validation complete.**

## Automated validation
- Frontend Node regression suite: **312 / 312 PASS**.
- Hosted Web/API Python suite: **47 / 47 PASS**.
- Compatible Beta 1 Bot regression suite: **437 / 437 PASS**.
- JS/JSX TypeScript-parser pass: **64 source files PASS**.
- Hosted Python AST compilation: **PASS**.

## Beta 2 regression coverage
- Detail dialogs capture and restore the underlying viewport.
- Detail-card focus returns with `preventScroll`.
- What's New, Expedition Board, Expedition Atlas, Travel Regions, Hunt Board, and Chocobo portrait gallery use viewport-anchored expansion.
- Player Guide Bestiary/Items catalog open/close no longer uses `scrollIntoView()`.
- Adventure Board current-activity summary and action-first ordering are present.
- Saved results and active Adventures receive priority above routine choices.
- Expedition Atlas detail is independently collapsible and remembers browser preference.
- Beta 1 balance and Alpha 2–5 Expedition progression remain represented by the full regression suite.

## Compatibility
- Hosted Web runtime: `1.2.0-expeditions-beta2`
- Frontend asset revision: `1.2.0-expeditions-b2`
- Compatible Bot runtime: `1.2.0-expeditions-b1` (unchanged)
- Local DB schema: **8**
- Hosted sync schema: **1**
- Portal Action protocol: **20**
- Database migration / player reset: **none**

## Packaging validation
- Beta 1 → Beta 2 Web patch contains changed/new files only; no deletions are required.
- Patch overlay exact-reproduction verification: **PASS**.
- Full Web ZIP integrity: **PASS**.
- Complete bundle ZIP integrity: **PASS**.
- Runtime/secret hygiene scan: **PASS**; no live `.env`, token stores, SQLite files, bytecode, logs, or cache directories are packaged.
- SHA-256 manifest verification: **PASS**.

## Production bundle note
The release source intentionally does not package `node_modules`; a local Vite production bundle was not executed. Source parsing plus the complete frontend regression suite are clean.
