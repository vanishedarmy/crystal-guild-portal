# Crystal Guild v1.1.18 — Inventory PNG Regeneration R03–R06

Frontend asset revision: `1.1.18-retro-phase-ii36`.

This Web-only checkpoint replaces the combined-sheet/cropped R03–R06 item artwork with individually packaged PNG assets and preserves the existing gameplay/catalog state.

## Artwork changes

- All **32 live consumables** now resolve through `item-icons-v3` as individual PNG files.
- CG-ITEM-R01 and R02 keep their approved standalone artwork; the newly regenerated R03 assets replace Regen Tonic, War Horn, Mage’s Incense, Smoke Bomb, Arctic Wind, Lightning Marble, Water Gem, Earth Drum, and Shadow Gem.
- `item-materials-v4` contains **31 individual PNG assets** covering Bomb Fragment plus all R04, R05, and R06 generated materials.
- The material library includes future-use concepts that are not yet live catalog items; those assets are packaged without modifying gameplay data.
- Every production PNG is normalized to a transparent **512×512** canvas with contained artwork so inventory cards do not crop or stretch the source art.

## Compatibility

- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii36`
- Bot runtime: unchanged (`1.1.18-recovery-h1`)
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **14** unchanged
- Twitch prefix: `!` unchanged

No database migration, player reset, OAuth change, environment-variable change, or Bot redeploy is required.
