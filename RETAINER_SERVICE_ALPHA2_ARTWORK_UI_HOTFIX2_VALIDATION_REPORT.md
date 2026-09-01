# Validation Report — Crystal Guild v1.7.0 — Retainer Service Alpha 2 Artwork & UI Hotfix 2

**Result: PASS**

## Release contract

- Runtime: `1.7.0-retainer-a2`
- Frontend asset revision: `1.7.0-retainer-a2h2`
- Local DB schema: **15**
- Hosted sync schema: **1**
- Portal Action protocol: **31**
- Twitch command prefix: `!`
- Baseline: Retainer Service Alpha 2 Artwork & UI Hotfix 1
- Scope: **Web-only Retainer layout correction**

## Corrective checks

- Retainer Service container explicitly declares a 12-column CSS grid.
- Desktop `span-4` Retainer profile and `span-8` Current Assignment panels therefore resolve to their intended widths.
- Retainer portrait has hard maximum width/height bounds instead of scaling against a full-width panel.
- Tablet and mobile portrait/crest limits are reduced at the existing responsive breakpoints.
- Retainer artwork bytes and `/retainer/a2h1/` routing are unchanged.
- No gameplay, economy, migration, persistence, or action-protocol behavior changed.

## Automated regression

- Frontend Node tests: **537 / 537 PASS**
- Hosted Web/API Python tests: **60 / 60 PASS**
- Web Python parse: **14 / 14 PASS**
- JS/MJS syntax: **197 / 197 PASS**
- CSS structural checks: **7 / 7 PASS**
- WebP decode: **843 / 843 PASS**
- Public PNG count: **0**

The canonical Alpha 2 Bot is unchanged by this Web-only hotfix. The packaged Web source does not contain installed `node_modules`, so a local Vite production-build pass is not claimed.
