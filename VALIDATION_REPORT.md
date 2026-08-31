# Validation Report — Gold Saucer Alpha 3 — MGP

## Result
**PASS**

## Regression suites
- Frontend unit/source regression: **487 / 487 PASS**.
- Hosted Web/API Python regression: **51 / 51 PASS**.

## Source gates
- Python AST parse: **10 / 10 PASS** across Web Python source/tests.
- Plain JS/MJS Node syntax: **179 / 179 PASS**.
- Alpha 3 focused tests verify canonical `mgp`, `daily_allowance_mgp`, and `records.net_mgp` consumption with Alpha 2 `points` fallbacks.
- Player Guide, Gold Saucer UI, What's New, and streamer controls use **MGP**.
- Historical Alpha 2 Monster Toss art remains under `/gold-saucer/a2h2/monster-toss/` and its historical visual manifest remains unchanged.

## Contract
- Hosted runtime: `1.6.0-gold-saucer-a3`
- Frontend asset revision: `1.6.0-gold-saucer-a3`
- Compatible Bot: `1.6.0-gold-saucer-a3`
- Local DB schema: **12**
- Hosted sync schema: **1**
- Portal Action protocol: **27**
- Twitch prefix: `!`

## Production frontend build gate
`npm run build` was attempted. This source package does not include installed `node_modules`, so the pinned local Vite executable is unavailable (`vite: not found`, exit 127). No local production-build pass is claimed; the normal hosted build installs the pinned dependencies before compiling.
