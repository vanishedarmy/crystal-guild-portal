# Crystal Guild v1.1.18 — Inventory Identity Regeneration: Items R01–R06

Frontend asset revision: `1.1.18-retro-phase-ii35`.

This Web-only visual build replaces the current item-art layer with the newly regenerated CG-ITEM-R01 through CG-ITEM-R06 production set while leaving gameplay and gear logic untouched.

## Regenerated consumables

The complete 32-consumable live catalog remains illustrated. Twenty-nine live consumables receive the new R01–R03 artwork. Antidote, Echo Herbs, and Remedy were not part of those generation batches, so their previously validated icons are carried into the new cache-busted `item-icons-v2` directory.

## Regenerated materials

The build packages 31 normalized material artworks from R03–R06 under `item-materials-v3`. Dedicated live mappings are enabled for Bomb Fragment, Iron Ore, Mythril Ore, Adamantite, Ancient Coin, Elemental Crystal, Wyvern Scale, Demon Horn, Tonberry Lantern, Dragon Heart, Holy Scale, Mimic Lock, Archon Shard, Dark Matter, Omega Core, and Shinryu Scale. Generated concepts that do not currently have a live catalog ID remain packaged for later use but are not injected into gameplay data.

## Image handling

Every integrated generated asset is normalized to a 256×256 WebP canvas. Source compositions are isolated and contained rather than stretched or cover-cropped. The shared `ItemArtwork` component continues using `object-fit: contain` across Inventory, Recovery, Moogle Emporium, item details, Player Guide, and Blacksmith surfaces.

## Compatibility

- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii35`
- Bot runtime: unchanged (`1.1.18-recovery-h1`)
- Local DB schema: unchanged
- Hosted sync schema: 1 unchanged
- Portal Action protocol: 14 unchanged
- Twitch prefix: `!` unchanged

No database migration, player reset, OAuth change, environment variable, or Bot redeploy is required.
