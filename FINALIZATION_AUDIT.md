# Finalization Audit — Crystal Guild v1.7.0 Retainer Service Alpha 2 Artwork & UI Hotfix 2

**Decision: PASS — corrected Web baseline.**

Hotfix 2 corrects the Retainer artwork layout regression introduced by the first artwork integration pass. The issue was structural: `RetainerService.jsx` used the shared `span-4`, `span-8`, and `span-12` grid-column utilities, but `.retainer-service-grid` did not declare a grid formatting context. As a result, the profile panel could occupy the full available width and make the portrait appear massively oversized.

## Fix

1. `.retainer-service-grid` now explicitly uses `display:grid` with twelve `minmax(0,1fr)` columns.
2. Desktop restores the intended 4/8 profile/current-assignment split.
3. Existing <=980px rules continue to stack profile/current panels to 12 columns.
4. Retainer portrait artwork is capped at 210×176 CSS px on desktop, with smaller tablet/mobile caps.
5. The rank crest is proportionally reduced.
6. All existing H1 Retainer artwork remains byte-identical under `/retainer/a2h1/`.

## Release contract

- Runtime: `1.7.0-retainer-a2`
- Frontend revision: `1.7.0-retainer-a2h2`
- Local schema: **15**
- Hosted sync: **1**
- Portal protocol: **31**
- Gameplay changes: **none**

## Regression gates

- Frontend: **537/537 PASS**
- Hosted Web/API: **60/60 PASS**
- Web Python parse: **14/14 PASS**
- JS/MJS syntax: **197/197 PASS**
- CSS structural checks: **7/7 PASS**
- WebP decode: **843/843 PASS**
- Public PNG count: **0**

No database, secrets, installed dependencies, runtime overlay state, or player data belong in the release archives.
