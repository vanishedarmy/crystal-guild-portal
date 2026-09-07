# Validation Report — Crystal Guild v1.7.1 Resynthesis Alpha 2 Hotfix 4

**Result: PASS**

## Release contract
- Scope: Web-only Moogle Emporium item-information hotfix
- Paired Bot runtime: `1.7.1-resynthesis-a2h3` (unchanged)
- Web runtime/frontend: `1.7.1-resynthesis-a2` (unchanged)
- Local DB schema: **15**
- Hosted sync schema: **1**
- Portal Action protocol: **32**
- Twitch command prefix: `!`

## Regression
- Bot: **686 / 686 PASS** (unchanged Hotfix 3 Bot)
- Frontend: **563 / 563 PASS**
- Hosted Web/API: **65 / 65 PASS**
- Bot Python parse: **121 / 121 PASS**
- Web Python parse: **16 / 16 PASS**
- JS/MJS syntax: **206 / 206 PASS**
- CSS structural checks: **8 / 8 PASS**
- WebP decode: **843 / 843 PASS**
- Public PNG count: **0**

## Focused Emporium checks
- Buy cards render shared canonical item-effect copy through `formatItemUse`.
- Sell rows render the same effect copy before disposal.
- Earth Drum resolves to `Deals 450 Earth damage`.
- Eye Drops resolves to `Removes Blind`.
- Smoke Bomb resolves to `Grants Evade for 2 rounds`.
- Hi-Potion resolves to `Restores 200 HP`.
- Tent resolves to `Restores All Stats`.
- Effect copy is visually capped at two lines.
- Prices, item data, stock weighting, eligibility, actual effects, and authoritative Bot behavior are unchanged.

The source-only Web package does not include installed `node_modules`, so no local Vite production-build result is claimed.
