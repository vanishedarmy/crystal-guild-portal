# Crystal Guild v1.1.19 — Retro Phase III / Facility Supply Balance

This Web checkpoint keeps the completed Retro Phase III visual rollout intact and adds the public Bestiary side of the Fellowship facility-material rebalance.

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

## Technical identity
- Web runtime: `1.1.19-retro-phase-iii`
- Frontend asset revision: `1.1.19-retro-phase-iii12`
- Portal Action protocol: `14`
- Hosted sync schema: `1`
- Paired Bot runtime: `1.1.19-retro-phase-iii-balance1`

No database migration, player reset, OAuth change, new environment variable, or Portal protocol migration is required.
