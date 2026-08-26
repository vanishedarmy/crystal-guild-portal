# Crystal Guild v1.1.18 — SNES Item Regeneration R01–R06

Frontend asset revision: `1.1.18-retro-phase-ii37`.

This Web-only checkpoint replaces the current item/material checkpoint art with the regenerated SNES/FF-inspired R01–R06 set. The build uses one transparent PNG per identity and removes superseded inventory-art asset directories that are no longer referenced.

## Artwork
- CG-ITEM-R01: 10 core recovery items.
- CG-ITEM-R02: 10 recovery/status/buff items.
- CG-ITEM-R03: 9 battle/utility consumables plus Bomb Fragment.
- CG-ITEM-R04: 10 common crafting materials.
- CG-ITEM-R05: 10 advanced crafting materials.
- CG-ITEM-R06: 10 rare/monster materials.
- Antidote, Echo Herbs, and Remedy remain on their existing individual PNG art because they were outside the defined R01–R03 regeneration batches.

## Cleanup
Removed superseded `item-icons-v2`, `item-icons-v3`, `item-materials-v3`, and `item-materials-v4` directories after moving all active references to `item-icons-v4` and `item-materials-v5`.

No Bot, database, hosted-sync schema, Portal Action protocol, OAuth, or environment change.
