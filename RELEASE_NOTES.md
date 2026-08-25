# Crystal Guild v1.1.18 — Retro Phase II
## Wave 7 Image Fit Hotfix

This Web-only hotfix standardizes artwork framing across Crystal Guild so portrait assets fill their intended UI frames without stretching, internal letterboxing, or mismatched card ratios.

### Portrait normalization
- All 70 monster portraits are rebuilt as true edge-to-edge 512×768 (2:3) WebP assets.
- Transparent padding left by earlier source conversions is removed before final export.
- Wider source compositions are proportionally center-cropped only as needed to reach 2:3; images are never stretched.
- Job portraits remain native 543×724 (3:4).
- Region artwork remains 16:9.

### Player Guide
- Job artwork now uses a native 3:4 presentation frame.
- Hunt artwork now uses a native 2:3 presentation frame.
- Mobile no longer forces portrait artwork into landscape 16:10 or 4:3 containers.

### Shared presentation
The normalized monster library is reused by Bestiary, Hunts, Hunt results, Player Guide, and Solo Venture combat.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii12`
- Monster asset library: `monster-portraits-v7h1`
- Bot runtime/schema/protocol/gameplay: unchanged
