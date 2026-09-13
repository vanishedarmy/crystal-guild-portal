# Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 5 — Battle Item Purpose Sort

This Web-only correction makes battle inventory scanning faster by sorting consumables by **what they are used for** instead of treating every item as one flat alphabetical list.

## Battle inventory order
Battle items now appear in this order:

1. **Restorative / revive** — HP, MP, AP recovery and revival items such as Potion, Ether, Phoenix Down, Stamina Draught, and Warrior’s Tonic.
2. **Status cures** — Antidote, Chronos Tear, Echo Herbs, Eye Drops, Remedy, Smelling Salts, and similar cleanse items.
3. **Buffs / support** — Iron Tonic, Regen Tonic, Smoke Bomb, Swiftwater, War Horn, Mage’s Incense, and other non-damage setup items.
4. **Direct damage** — Arctic Wind, Bomb Fragment, Earth Drum, Lightning Marble, Water Gem, and similar enemy-targeted damage items.

Items remain **alphabetical inside their purpose group** for predictable scanning.

## Shared behavior
- Solo Venture battle inventory uses the new ordering.
- Dungeon battle inventory uses the same ordering.
- Expedition battle items use the same ordering.
- Disabled items remain in their proper purpose group instead of being moved elsewhere just because the current Job cannot use them.
- The sorter understands structured effect metadata when present and also handles the compact battle payload used by the Portal.
- Sorting copies the array and does not mutate the authoritative combat snapshot.

## Compatibility
Desktop Item Control Fit, Mobile Control Fit, HTTP Response Efficiency, Full Rest & Combat Continuity, authoritative Gear Favorites, and all existing item effects remain unchanged.

Runtime remains `1.7.1-resynthesis-a2h5`; local schema **16**, hosted sync **1**, Portal protocol **33**. No migration or player reset.
