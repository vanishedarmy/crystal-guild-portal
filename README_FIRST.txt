Crystal Guild v1.1.18 — Inventory Identity Regeneration: Items R01–R06
Frontend asset revision: 1.1.18-retro-phase-ii35
Bot runtime compatibility: 1.1.18-recovery-h1

This Web-only build integrates the regenerated CG-ITEM-R01 through CG-ITEM-R06 artwork set.

- All 32 canonical consumables now resolve through the cache-busted item-icons-v2 library.
- 29 consumables use newly regenerated artwork; Antidote, Echo Herbs, and Remedy carry forward their validated icons because they were not part of R01–R03.
- 31 normalized R03–R06 material assets are packaged under item-materials-v3.
- 16 live materials now receive dedicated generated identities instead of generic ore/crystal/family artwork where applicable.
- Existing weapon, armor, and accessory Phase 2 artwork remains unchanged pending CG-GEAR-R01 and later gear waves.

No database migration, Portal Action protocol change, OAuth change, environment-variable change, Bot update, or player reset is required.
