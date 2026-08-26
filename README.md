# Crystal Guild v1.1.19 — Retro Phase III

This Web build packages the latest Retro Phase III gear-art cleanup and fallback correction pass.

## Included in this build
- **CG-GEAR-R01 through R18** remain consolidated in `frontend/public/retro-phase-iii/weapon-icons-v1/` as **180 individual PNG assets**.
- The old shared WebP weapon-family fallbacks have been replaced by **11 new 512×512 transparent PNG family assets** in `frontend/public/retro-phase-iii/weapon-families-v1/`.
- Updated family fallbacks: Axe, Dagger, Firearm, Instrument, Katana, Knuckles, Rapier, Spear, Staff, Sword, and Wand.
- Legacy weapon-family WebPs and obsolete weapon-tier fallback WebPs are removed from the package.
- The Artisan's Hammer accessory now reuses the packaged `steel_warhammer.png` identity instead of retaining a legacy hammer-tier WebP.

## Technical identity
- Hosted Web runtime: `1.1.19-retro-phase-iii`
- Frontend asset revision: `1.1.19-retro-phase-iii5`
- Portal Action protocol: `14`
- Hosted sync schema: `1`

No database migration, player reset, OAuth change, or new environment variable is required.
