# Validation Report — Gold Saucer Alpha 2 Canonical Baseline

## Result
**PASS**

## Regression suites
- Bot: **615 / 615 PASS**.
- Frontend: **484 / 484 PASS**.
- Hosted Web/API: **51 / 51 PASS**.

## Source / asset gates
- Python parse: **116 / 116 PASS** across Bot + Web.
- Frontend JS/JSX/MJS TypeScript-parser sweep: **220 / 220 PASS**.
- Plain JS/MJS Node syntax: **178 / 178 PASS**.
- CSS parse: **8 / 8 PASS**.
- Public artwork: **0 PNG / 692 WebP**, **692 / 692 decode PASS**.
- Monster Toss active visual family: **17 / 17 WebP present**.
- Redundant `marquee.webp`: absent from shipping tree and absent from Monster Toss DOM.

## Production frontend build gate
`npm run build` was attempted. This source-only environment does not contain the pinned local Vite executable (`vite: not found`, exit 127), so no local Vite production-build pass is claimed.

## Frozen contract
Hosted/Bot runtime `1.6.0-gold-saucer-a2`; frontend asset revision `1.6.0-gold-saucer-a2h2`; local DB schema **12**; hosted sync **1**; Portal Action protocol **27**; prefix `!`. No gameplay/economy/backend change.
