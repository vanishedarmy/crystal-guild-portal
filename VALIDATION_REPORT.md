# Validation Report — Gold Saucer Alpha 4 — Chocobo Racing

## Result
**PASS**

## Regression suites
- Frontend: **490 / 490 PASS**.
- Hosted Web/API: **53 / 53 PASS**.
- Alpha 4 frontend-focused tests: **3 / 3 PASS**.
- Alpha 4 hosted relay-focused tests: **2 / 2 PASS**.

## Source / asset gates
- Python parse across matched Bot + Web: **119 / 119 PASS**.
- Frontend JS/JSX/MJS TypeScript-parser sweep: **222 / 222 PASS**.
- Plain JS/MJS Node syntax: **180 / 180 PASS**.
- CSS parse: **8 / 8 PASS**.
- Public artwork: **0 PNG / 692 WebP**; **692 / 692 WebP decode PASS**.

## Chocobo Racing coverage
- Portal protocol **28** accepts only canonical `CHOCOBO_RACE` course/strategy payloads and rejects malformed values.
- Gold Saucer UI exposes existing Chocobo portrait/name/Bond level/traits, course gates, pace choices, three daily entries, reset state, last-race result, ledger records, and MGP settlement.
- Player Guide documents the same Alpha 4 rules.
- Triple Triad remains Coming Soon.

## Production frontend build gate
`npm run build` was attempted. This source-only package does not contain `node_modules`, so the pinned Vite executable is unavailable (`vite: not found`, exit 127). No local Vite production-build pass is claimed; normal deployment must install the pinned frontend dependencies before compiling.

## Frozen contract
Hosted/frontend/Bot runtime `1.6.0-gold-saucer-a4`; local DB schema **12**; hosted sync **1**; Portal Action protocol **28**; prefix `!`; MGP remains canonical.
