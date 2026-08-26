# Crystal Guild v1.1.18 — Inventory Identity Phase 2

This Web-only visual update advances the frontend asset revision to `1.1.18-retro-phase-ii32` and packages all artwork generated after the first consumables pass.

## Artwork integrated
- 20 ore/metal family icons.
- 8 elemental/magical crystal icons.
- 12 weapon-family base icons.
- 36 generated weapon-tier variants, with matching Sword, Dagger, Axe, and Staff families using level-based variants now and the remaining generated variants retained for later family expansion.
- 36 armor-tier variants.
- 24 armor/accessory family variants.
- Existing 32 consumable icons remain unchanged.

The Web build therefore carries **168 item/equipment art assets**. All 186 weapons, all 65 armor pieces, and all 38 accessories now resolve to shared family/tier artwork. 39 of 84 current materials are illustrated through the ore/metal/crystal/core families; monster-part materials remain deliberately unassigned until the dedicated monster-parts artwork wave.

## UI integration
Shared artwork remains active in Inventory, Recovery, Moogle Emporium, item detail dialogs, and the Player Guide. This pass also adds it to Guild Blacksmith Forge Gear, recipe outputs, and supported recipe materials.

## Compatibility
- Frontend asset revision: `1.1.18-retro-phase-ii32`
- Compatible Bot runtime: `1.1.18-recovery-h1`
- Local DB schema: 5 unchanged
- Hosted sync schema: 1 unchanged
- Portal Action protocol: 14 unchanged
- Twitch prefix: `!` unchanged

No database migration, OAuth change, environment-variable change, or player reset is required.
