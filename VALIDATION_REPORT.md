# Monster Identity Wave 8 — Validation Report

Prepared from the validated Wave 7 Image Fit Hotfix Web baseline.

## Asset and mapping checks
- 10 new Wave 8 portrait assets added.
- Shared portrait library moved to cache-busted `monster-portraits-v8`.
- **80 total monster portrait WebP assets** packaged.
- **80/80 portrait mappings** resolve to authoritative live Bestiary IDs and real packaged files.
- **80/80 monster portraits** are normalized to edge-to-edge **512×768 (2:3)** assets.
- Wave 7 image-fit rules remain active for Job portraits, monster portraits, Guide cards, Hunts, and Solo Venture combat.

## Regression validation
- Frontend unit/regression tests: **230/230 PASS**.
- Hosted Web/API tests: **46/46 PASS**.
- No Bot logic, gameplay data, DB schema, hosted sync schema, OAuth flow, or Portal Action protocol changes were introduced.

## Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii13`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
