# Validation — v1.1.18 SNES Gear Regeneration R05–R10

Frontend asset revision: `1.1.18-retro-phase-ii40`.

## Automated checks
- Frontend unit tests: **277 / 277 passed**.
- Hosted Web/API tests: **46 / 46 passed**.

## Artwork checks
- `weapon-icons-v5`: **100 / 100** named CG-GEAR-R01–R10 assets present.
- CG-GEAR-R05: **10 / 10** individual PNGs present.
- CG-GEAR-R06: **10 / 10** individual PNGs present.
- CG-GEAR-R07: **10 / 10** individual PNGs present.
- CG-GEAR-R08: **10 / 10** individual PNGs present.
- CG-GEAR-R09: **10 / 10** individual PNGs present.
- CG-GEAR-R10: **10 / 10** individual PNGs present.
- Every named weapon file is a **512×512 RGBA PNG** with alpha transparency.
- Named R05–R10 catalog identities resolve to `weapon-icons-v5` before shared family/tier fallbacks.
- Equipment outside the regenerated named identities continues to resolve through the existing Phase 2 fallback libraries.
- Superseded `weapon-icons-v4` is absent from the full build.

## Compatibility
No database migration, hosted-sync schema change, Portal Action protocol change, OAuth change, environment-variable change, Bot update, or player reset is required.

## Package verification
- Fresh extraction of the full ii40 Web ZIP matches the source package tree.
- Clean ii39 extraction + ii39→ii40 patch + documented `weapon-icons-v4` deletion matches the full ii40 tree.
- Full-package verification passed **277 / 277** frontend tests and **46 / 46** hosted Web/API tests.
- Patch verification passed **277 / 277** frontend tests and **46 / 46** hosted Web/API tests.
