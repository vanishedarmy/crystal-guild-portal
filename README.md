# Crystal Guild v1.1.19 — Retro Phase III / Chocobo Portraits

This paired Web checkpoint adds persistent player-selectable Chocobo portraits while retaining the completed Retro Phase III artwork and the iii12 Facility Supply Balance.

## Chocobo portraits
- Registered Chocobos can choose from 10 SNES/FF-style portrait options in the Chocobo Stable.
- Portrait choice is saved by the authoritative Bot through `SET_CHOCOBO_PORTRAIT`.
- The selected portrait is visible on both the owner Stable and read-only public Chocobo cards.
- Existing Chocobos migrate to Classic Gold automatically; Bond, traits, names, and progression are untouched.

## Technical identity
- Hosted Web runtime: `1.1.19-retro-phase-iii-chocobo1`
- Frontend asset revision: `1.1.19-retro-phase-iii13`
- Portal Action protocol: `15`
- Hosted sync schema: `1`
- Paired Bot runtime: `1.1.19-retro-phase-iii-chocobo1`
- Local Bot DB schema: `6`

## Facility supply balance
- **Ancient Coin** now appears on Ossuary Knight, Mimic, Magic Pot, and Ancient Mimic.
- **Hi-Potion** now appears on Goblin Chieftain, Mimic, and Tonberry, in addition to its existing crafting/shop acquisition routes.
- **Mythril Ore** now appears across Spriggan, Gigas, Mimic, Iron Giant, and Ancient Adamantoise.
- **Wyvern Scale** now appears across Cockatrice, Basilisk, Sea Serpent, Red Dragon, Blue Dragon, and Wyrm.
- **Elemental Crystal** now appears across early Flan/Bomb enemies and increasingly efficient crystal/elemental enemies later in progression.
- **Demon Horn** now begins with Imp and continues through progressively stronger demonic enemies instead of having no normal monster source.

The Player Guide Bestiary reads these percentages directly from `guide-data.json`, which is aligned to the paired authoritative Bot data for this release.

## Retro Phase III continuity
- All prior iii11 item/weapon artwork remains in place.
- Current material artwork coverage remains complete.
- No retired artwork path is restored by this balance checkpoint.
