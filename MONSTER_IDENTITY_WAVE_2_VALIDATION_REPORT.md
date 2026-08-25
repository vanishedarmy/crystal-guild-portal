# Crystal Guild v1.1.18 — Retro Phase II Monster Identity Wave 2 Validation

## Result
PASS

## Automated regression
- Frontend: 211 / 211 PASS
- Hosted Web/API: 46 / 46 PASS

## Artwork checks
- `monster-portraits-v2`: 20 standalone WebP assets.
- All monster portraits: 512 × 768 (2:3).
- All 18 live Player Guide Jobs resolve through `jobPortraitPath()` to existing `job-portraits-v2` files.
- All 20 illustrated monsters resolve through `monsterPortraitPath()` to existing `monster-portraits-v2` files.
- Guide and Portal image rules use `object-fit: contain`; no cover-crop path is used for Job/monster portrait art.
- Superseded `job-portraits-v1` and `monster-portraits-v1` directories are omitted from the clean full Web package.

## Release contract
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii7`
- DB schema: 5
- Hosted sync schema: 1
- Portal Action protocol: 14
- Compatible Bot runtime: `1.1.17-arsenal-ii-h4`
