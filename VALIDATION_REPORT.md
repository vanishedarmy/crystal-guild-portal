# Validation Report — Crystal Guild v1.7.0 — UI Compactness Hotfix 4

**Result: PASS**

## Release contract

- Web runtime/frontend: `1.7.0-emporium-annex-a3h4`
- Paired Bot runtime: `1.7.0-emporium-annex-a3h3`
- Local DB schema: **15**
- Hosted sync schema: **1**
- Portal Action protocol: **31**
- Twitch command prefix: `!`
- Gameplay/data changes: **none**

## Automated regression

- Frontend: **549 / 549 PASS**
- Hosted Web/API: **61 / 61 PASS**
- Web Python parse: **15 / 15 PASS**
- JS/MJS syntax: **201 / 201 PASS**
- CSS structural checks: **8 / 8 PASS**
- WebP decode: **843 / 843 PASS**
- Public PNG count: **0**

## Focused UI checks

**PASS** — Blacksmith Recipes/Forge Gear subtitles contain no redundant `Active ·` prefix.

**PASS** — Registered Companion and recipe grids use start alignment/content-sized cards rather than row stretching.

**PASS** — Emporium buy-card markup omits the long item-description paragraph while retaining stat summaries and requirements.

**PASS** — Fellowship mobile level card is max-width bounded, overflow-safe, and its progress track remains inside the card.

**PASS** — Crystal Guild Connection omits the linked-account explanatory sentence and exposes **Refresh connection**.

The source package contains no installed `node_modules`, so no local Vite production-build claim is made.
