# Crystal Guild v1.1.18 — SNES Gear Regeneration R05–R10

Frontend asset revision: `1.1.18-retro-phase-ii40`.

This Web-only checkpoint integrates six additional regenerated gear waves and consolidates **CG-GEAR-R01 through CG-GEAR-R10** into the new `weapon-icons-v5` library.

## CG-GEAR-R05 — Staves, Rods & Mage Weapons
Ten standalone transparent PNG identities:
- Oak Staff
- Elm Staff
- Rune Staff
- Silver Staff
- Priest's Staff
- Fire Rod
- Frost Rod
- Thunder Rod
- Elemental Staff
- Astral Staff

Current staff/rod catalog equivalents now prefer these named assets where appropriate. Nirvana, Stardust Rod, Sage, High Mage, Wizard, and Magus variants use the closest regenerated identity while retaining their own item data.

## CG-GEAR-R06 — Bows & Ranged Weapons
Ten standalone transparent PNG identities:
- Shortbow
- Longbow
- Great Bow
- Killer Bow
- Elven Bow
- Rune Bow
- Yoichi Bow
- Hunting Rifle
- Magitek Rifle
- Artemis Bow

The bow identities are packaged and reserved for future catalog use. Current firearm entries now use Hunting Rifle or Magitek Rifle artwork where appropriate, including the live Magitek Rifle identity.

## CG-GEAR-R07 — Katana & Samurai Weapons
Ten standalone transparent PNG identities:
- Ashigaru Katana
- Iron Katana
- Steel Katana
- Osafune
- Kogarasu
- Kotetsu
- Kiyomori
- Genji Katana
- Kiku-ichimonji
- Heaven's Cloud

Current katana identities now prefer the new named artwork. Murasame, Murakumo, Ame-no-Murakumo, Riven Katana, and Masamune stages use the closest regenerated katana identity.

## CG-GEAR-R08 — Knuckles, Cesti & Claws
Ten standalone transparent PNG identities:
- Leather Knuckles
- Brass Knuckles
- Iron Knuckles
- Steel Cesti
- Tiger Cesti
- Mythril Claws
- Wyvern Claws
- Diamond Knuckles
- Demon Claws
- Godhand

Current knuckle/claw entries now prefer the regenerated named artwork. Godhand stages share the Godhand identity; Dragon/Hell/Tiger variants use the closest matching regenerated claw/cesti art.

## CG-GEAR-R09 — Wands, Scepters & Focuses
Ten standalone transparent PNG identities:
- Ash Wand
- Willow Wand
- Yew Wand
- Silver Wand
- Rune Wand
- Mythril Wand
- Sage's Wand
- Crystal Wand
- Starfall Wand
- Stardust Wand

Current wand catalog identities now prefer these individual PNGs. Magus and Mystic Wands use the closest regenerated focus artwork.

## CG-GEAR-R10 — Harps & Bard Instruments
Ten standalone transparent PNG identities:
- Traveler's Harp
- Maple Harp
- Silver Harp
- Rosewood Harp
- Faerie Harp
- Dream Harp
- Siren Harp
- Rune Harp
- Lamia Harp
- Apollo Harp

Current harp identities now prefer the new named artwork. Seraph, Celestial, and Minstrel variants use the closest regenerated harp identity.

## Artwork normalization and cleanup
- `weapon-icons-v5` contains **100** individual 512×512 RGBA PNG assets covering CG-GEAR-R01 through R10.
- CG-GEAR-R05 through R10 contribute **60** new named PNG assets.
- Each production file is a standalone PNG with alpha transparency; no sprite sheet or dark-background composite is used by the named library.
- The superseded `weapon-icons-v4` directory is removed from the full ii40 package.
- Existing `weapon-families-v2` and `weapon-tiers-v2` remain because equipment outside the named regeneration waves still depends on them.

No Bot, database, hosted-sync schema, Portal Action protocol, OAuth, environment-variable, or player-data change.
