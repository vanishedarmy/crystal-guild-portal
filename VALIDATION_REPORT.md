# Wave 7 Image Fit Hotfix — Validation Report

## Asset standards
- Monster portraits: **70/70** at **512×768 (2:3)**.
- Monster portraits with internal transparent padding: **0/70**.
- Job portraits: **19/19** at **543×724 (3:4)**.
- Region artwork: **8/8** at **1672×941 (approximately 16:9)**.

## UI standards
- Monster portrait component: 2:3.
- Job portrait component: 3:4.
- Player Guide Job artwork: 3:4.
- Player Guide Hunt artwork: 2:3.
- Player Guide mobile portrait artwork no longer switches to landscape ratios.
- `object-fit: contain` remains in place, so browser rendering does not stretch artwork.
- Bestiary, Hunts, Hunt Results, Player Guide, and Solo Venture all use the normalized shared monster library.

## Regression validation
- Frontend unit/regression tests: **227/227 PASS**.
- Hosted Web/API tests: **46/46 PASS**.
- Monster asset dimension audit: **70/70 PASS**.
- Job asset dimension audit: **19/19 PASS**.
- Region asset dimension audit: **8/8 PASS**.

## Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii12`
- Monster library: `monster-portraits-v7h1`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
