# Validation — v1.1.18 SNES Item Regeneration R01–R06

Frontend asset revision: `1.1.18-retro-phase-ii37`.

## Automated checks
- Frontend unit tests: **265 / 265 passed**.
- Hosted Web/API tests: **46 / 46 passed**.

## Artwork checks
- `item-icons-v4`: **32 / 32** canonical consumable PNGs, each a separate **512×512** PNG with alpha transparency.
- Of those 32, **29** are regenerated R01–R03 assets; Antidote, Echo Herbs, and Remedy retain their previous validated individual PNG art because they were outside the defined generation batches.
- `item-materials-v5`: **31 / 31** regenerated R03–R06 material PNG identities, each a separate **512×512** PNG with alpha transparency.
- All live consumables resolve through the cache-busted `item-icons-v4` path.
- All defined R03–R06 generated material identities resolve through `item-materials-v5`.
- Existing weapon, armor, and accessory Phase 2 paths remain valid and unchanged.

## Cleanup checks
Confirmed removed from the full build:
- `item-icons-v2`
- `item-icons-v3`
- `item-materials-v3`
- `item-materials-v4`

No database migration, hosted-sync schema change, Portal Action protocol change, OAuth change, environment-variable change, Bot update, or player reset is required.
