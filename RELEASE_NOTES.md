# Crystal Guild v1.1.18 — Inventory Identity Pass: Phase 1

This Web-only visual release packages all 32 consumable icons created in artwork Waves 1, 2, 3A, and 3B and introduces the reusable item-art identity layer.

## Included
- 32 transparent 256×256 WebP consumable icons.
- Recovery quick actions now show the appropriate usable consumable icon.
- Inventory consumable cards show item artwork without crowding equipment/material cards that do not have art yet.
- Moogle Emporium buy and sell entries show artwork when a mapped consumable is present.
- Consumable item detail dialogs feature a larger item portrait.
- Player Guide item catalog rows show mapped item artwork.
- Future material, weapon, armor, and accessory waves can extend the same `itemArtwork` mapping.

## Compatibility
- Bot runtime: `1.1.18-recovery-h1`
- Frontend asset revision: `1.1.18-retro-phase-ii31`
- Local DB schema: 5 unchanged
- Hosted sync schema: 1 unchanged
- Portal Action protocol: 14 unchanged
- Twitch prefix: `!` unchanged

No migration or player reset is required.
