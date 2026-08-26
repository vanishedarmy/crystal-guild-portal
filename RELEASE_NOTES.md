# Release Notes — Crystal Guild v1.1.19 Retro Phase III

Frontend asset revision: `1.1.19-retro-phase-iii3`.

## Gear fallback cleanup
The shared weapon-family fallback artwork has been rebuilt in the same SNES/Final Fantasy-inspired visual language as the individual gear sprites.

New transparent PNG family assets:
- Axe
- Dagger
- Firearm
- Instrument
- Katana
- Knuckles
- Rapier
- Spear
- Staff
- Sword
- Wand

The Web now resolves unmapped weapon-family artwork through `retro-phase-iii/weapon-families-v1/*.png` instead of the old Phase II WebP assets. Tier-specific sword, dagger, axe, and staff fallback WebPs are no longer used. The Artisan's Hammer accessory now reuses the existing `steel_warhammer.png` artwork.

## Cleanup
- Removed `retro-phase-ii/weapon-families-v2/`.
- Removed `retro-phase-ii/weapon-tiers-v2/`.
- Removed the obsolete ii40 deletion manifest from the clean full package.
- Preserved the 180 named CG-GEAR-R01–R18 PNG assets.

No Bot, database, OAuth, environment-variable, hosted-sync schema, or Portal Action protocol change is required.
