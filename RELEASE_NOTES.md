# Crystal Guild v1.1.18 — Inventory Identity Asset Cleanup Hotfix

This Web-only visual hotfix advances the frontend asset revision to `1.1.18-retro-phase-ii33`.

The shared Phase 2 inventory/equipment artwork has been fully re-extracted from the generated source sheets using a safer transparency and cell-isolation process. The ii32 extraction could incorrectly erase dark armor surfaces, thin weapon details, and portions of paired equipment, producing fragmented-looking icons. The ii33 pass replaces all 136 shared Phase 2 assets while retaining the 32 previously validated consumable icons.

The build still contains **168 Inventory Identity assets** and keeps the same item-to-art mappings: all 186 weapons, 65 armor pieces, and 38 accessories resolve to shared artwork, while 39 of 84 current materials use the existing ore/metal/crystal/core families.

Compatibility remains unchanged: Bot runtime `1.1.18-recovery-h1`, local DB schema 5, hosted sync schema 1, Portal Action protocol 14, Twitch prefix `!`.

No database migration, Bot update, OAuth change, environment-variable change, or player reset is required.
