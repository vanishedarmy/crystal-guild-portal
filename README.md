# Crystal Guild Web — v1.1.18 Retro Phase II

Hosted Web runtime: `1.1.18-retro-phase-ii` · frontend asset revision `1.1.18-retro-phase-ii34` · hosted sync schema **1** · Portal Action protocol **14**.

Frontend revision `1.1.18-retro-phase-ii34` moves all corrected Phase 2 inventory/equipment artwork to new `-v2` public paths. This forces browsers and static/CDN caches to fetch the repaired assets instead of reusing stale corrupted ii32 files that shared the old URLs.

This build carries forward the complete Retro Phase II visual suite, the mobile header / Player Guide viewport hotfix, 107/107 Bestiary monster portraits, and now **37/37 World / Raid Boss 16:9 artwork coverage**.

Raid artwork is shared across the Player Guide boss catalog and dossier modal, Player Records, Trophy Hall, boss detail dialogs, and the OBS raid overlay. Boss gameplay data, progression, schemas, OAuth behavior, and Portal Action behavior are unchanged.


Latest Web presentation layer: **Retro Environment Pass** adds transparent pixel-art airship/crystal/portal ambience, gold dividers, and readable fantasy UI typography.


Latest Web visual pass: Cinzel Typography Pass applies the retro display font to major identity text while preserving body readability.

## Inventory Identity Asset Cleanup Hotfix

Frontend revision `1.1.18-retro-phase-ii34` rebuilds the 136 shared Phase 2 material/equipment assets with a safer sprite-sheet extraction pipeline. Dark armor, thin weapon details, paired equipment, and accessory silhouettes now retain their intended artwork without the fragmented transparency seen in ii32. The 32 previously validated consumable icons remain unchanged.

The Inventory Identity system remains wired through Inventory, Recovery, Moogle Emporium, item details, the Player Guide, recipes, and Forge Gear. Monster-part material families remain a later artwork wave.
