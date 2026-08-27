# Crystal Guild v1.1.19 — Retro Phase III / Release Candidate 1

RC1 finalizes the Retro Phase III Web presentation while retaining Chocobo portraits, Facility Supply Balance, and the completed artwork catalog. It adds scenic backgrounds to Camp/Recovery, Blacksmith, Chocobo Stable, and Moogle Emporium, plus a final routing/cleanup audit.

## Chocobo portraits
- Registered Chocobos can choose from 10 SNES/FF-style portrait options in the Chocobo Stable.
- Portrait choice is saved by the authoritative Bot through `SET_CHOCOBO_PORTRAIT`.
- The selected portrait is visible on both the owner Stable and read-only public Chocobo cards.
- Existing Chocobos migrate to Classic Gold automatically; Bond, traits, names, and progression are untouched.

## Technical identity
- Hosted Web runtime: `1.1.19-retro-phase-iii-rc1`
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1`
- Portal Action protocol: `15`
- Hosted sync schema: `1`
- Paired Bot runtime: `1.1.19-retro-phase-iii-rc1`
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
