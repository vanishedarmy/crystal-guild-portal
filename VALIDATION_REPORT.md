# Validation Report — iii12 Facility Supply Balance

## Automated validation

- Frontend Node tests: **281 / 281 PASS**.
- Hosted Web/API Python tests: **46 / 46 PASS**.
- Facility-supply frontend regression coverage confirms the published Bestiary has multiple sources, early practical sources, and the intended thematic early source for each recurring facility material.
- Production Vite bundle: **not run in this clean source workspace** because the shipping source intentionally has no `node_modules`; normal hosted deployment installs pinned dependencies before building.

## Bot / Web parity

The six recurring Fellowship facility-material drop tables in `frontend/public/guide-data.json` are checked against the authoritative Bot `data/monsters.json` during final package validation. The release gate is exact parity for all facility-material drops.

## Release identity

- Web runtime: `1.1.19-retro-phase-iii`
- Frontend asset revision: `1.1.19-retro-phase-iii12`
- Paired Bot runtime: `1.1.19-retro-phase-iii-balance1`
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **14** unchanged
- Player reset: **none**
