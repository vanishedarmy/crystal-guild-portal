# Crystal Guild v1.1.18 — SNES Gear Regeneration R03–R04

Frontend asset revision: `1.1.18-retro-phase-ii39`.

This Web-only checkpoint adds the next two regenerated gear waves and rolls the named weapon library forward from `weapon-icons-v3` to `weapon-icons-v4`.

## CG-GEAR-R03 — Axes, Hammers & Heavy Weapons
Ten standalone transparent PNG identities are included:
- Battle Axe
- Ornate Battle Axe
- Froststeel Greataxe
- Mythril Crescent Axe
- Ogekiller
- Runic Frostfire Axe
- Steel Warhammer
- Mythril Hammer
- Earthshaker Hammer
- Crescent Greataxe

Current axe-catalog equivalents now prefer these named assets where the identity is a close match: Hunter's Axe, Bronze Waraxe, Iron Waraxe, Steel Greataxe, Mythril Greataxe, Rune Axe, Ogre Cleaver, and Ogre Axe. The three hammer identities remain packaged and reserved because the current live weapon catalog does not yet contain a hammer weapon family.

## CG-GEAR-R04 — Spears & Polearms
Ten standalone transparent PNG identities are included:
- Spear
- Javelin
- Mythril Spear
- Trident
- Partisan
- Ice Lance
- Holy Lance
- Dragon Lance
- Gungnir
- Longinus

Current close catalog equivalents now prefer the new named artwork, including Training Spear, Mythril Lance, Coral Trident, Partisan, Holy Lance, Dragon Lance / Dragon Spear / Dragonbone Spear / Wyvern spear variants, and Gungnir Fragment. Other spear entries continue to use the existing shared spear-family fallback until their own regeneration wave is available.

## Artwork normalization and cleanup
- `weapon-icons-v4` contains **40** individual 512×512 RGBA PNG assets covering CG-GEAR-R01 through R04.
- The superseded `weapon-icons-v3` directory is removed from the full ii39 package.
- Existing `weapon-families-v2` and `weapon-tiers-v2` remain because unregenerated weapons still depend on them.
- No sprite sheets or dark-background composites are used by the named R03/R04 production assets.

No Bot, database, hosted-sync schema, Portal Action protocol, OAuth, environment-variable, or player-data change.
