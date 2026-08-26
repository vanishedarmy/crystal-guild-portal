# Crystal Guild v1.1.19 — Retro Phase III

This Web build packages the latest Retro Phase III artwork-routing and material-art checkpoint.

## Included in this build
- **CG-GEAR-R01 through R18** remain consolidated in `frontend/public/retro-phase-iii/weapon-icons-v1/` as **180 individual PNG assets**.
- Refreshed Phase III weapon-family and equipment-family artwork remains active at the cache-busted Phase III paths introduced in iii3–iii6.
- **CG-MAT-R01** adds 10 verified monster-drop material sprites.
- **CG-MAT-R03** adds 10 verified hunt/boss material sprites.
- New material assets live in `frontend/public/retro-phase-iii/material-icons-v1/` as normalized **512×512 PNGs**.
- Material artwork coverage improves from **45/84 to 65/84** with **0 broken artwork file paths**.
- CG-MAT-R02 and CG-MAT-R04 are deliberately held out of live routing because their generated images did not match the planned material identities. See `MATERIAL_ARTWORK_QA_REPORT.md`.

## Technical identity
- Hosted Web runtime: `1.1.19-retro-phase-iii`
- Frontend asset revision: `1.1.19-retro-phase-iii7`
- Portal Action protocol: `14`
- Hosted sync schema: `1`

No database migration, player reset, OAuth change, or new environment variable is required.
