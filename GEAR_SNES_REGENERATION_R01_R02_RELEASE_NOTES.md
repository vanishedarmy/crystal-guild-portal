# Crystal Guild v1.1.18 — SNES Gear Regeneration R01–R02

Frontend asset revision: `1.1.18-retro-phase-ii38`.

This Web-only checkpoint integrates the first two regenerated gear waves as named, standalone transparent PNG assets while preserving the existing Phase 2 shared weapon families as fallbacks for equipment not yet regenerated.

## Artwork
- CG-GEAR-R01 — Swords & Great Blades: 10 individual PNGs.
  - Iron Sword
  - Steel Sword
  - Mythril Sword
  - Flametongue
  - Icebrand
  - Coral Sword
  - Blood Sword
  - Defender
  - Excalibur
  - Ragnarok
- CG-GEAR-R02 — Daggers, Rapiers & Rogue Weapons: 10 individual PNGs.
  - Knife
  - Dagger
  - Mythril Knife
  - Mage Masher
  - Poison Fang
  - Main Gauche
  - Assassin's Dagger
  - Rapier
  - Rune Blade
  - Ultima Blade

All 20 assets are packaged under `frontend/public/retro-phase-ii/weapon-icons-v3/` as separate 512×512 RGBA PNG files.

## Live catalog integration
Named current-catalog equivalents now prefer the new individual artwork before the older family/tier fallback, including Iron Blade, Steel Longsword, Mythril Sword, Flametongue, Icebrand, Coral Sword, Blood Sword, Defender, the Excalibur relic stages, Bronze Dagger, Mythril Dagger, Mage Masher, Poison Fang, Assassin Dagger, Copper Rapier, and Rune Blade.

The planned identities Ragnarok, Knife, Main Gauche, and Ultima Blade are also reserved in the artwork map so their PNGs are ready when those exact catalog entries are introduced.

## Asset cleanup
No existing shared weapon family/tier directory is removed in this checkpoint because those files are still actively used by weapons outside CG-GEAR-R01/R02. The new named PNG library overrides only the regenerated identities and their close canonical aliases.

No Bot, database, hosted-sync schema, Portal Action protocol, OAuth, environment-variable, or player-data change.
