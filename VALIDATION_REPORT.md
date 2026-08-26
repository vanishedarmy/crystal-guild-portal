# Crystal Guild v1.1.18 — Inventory Identity Regeneration R01–R06 Validation

Frontend asset revision: `1.1.18-retro-phase-ii35`.

## Automated regression

- Frontend Node regression suite: **264 / 264 PASS**.
- Hosted Web/API pytest suite: **46 / 46 PASS**.
- Canonical catalog counts preserved: **32 consumables**, **84 materials**, **186 weapons**, **65 armor**, **38 accessories**.

## Artwork validation

- `item-icons-v2`: **32 / 32** packaged WebP assets, all exactly **256×256** and decodable.
- `item-materials-v3`: **31 / 31** packaged WebP assets, all exactly **256×256** and decodable.
- All 32 live consumables resolve to `item-icons-v2`.
- **16 live materials** resolve to dedicated regenerated R03–R06 identities: Bomb Fragment, Iron Ore, Mythril Ore, Adamantite, Ancient Coin, Elemental Crystal, Wyvern Scale, Demon Horn, Tonberry Lantern, Dragon Heart, Holy Scale, Mimic Lock, Archon Shard, Dark Matter, Omega Core, and Shinryu Scale.
- Existing Phase 2 equipment mapping remains intact for **186 / 186 weapons**, **65 / 65 armor**, and **38 / 38 accessories**.
- R01/R02 standalone sources are isolated on transparent 256×256 canvases.
- R03–R06 card-source artwork is normalized with a contained dark backplate rather than aggressive alpha extraction. This intentionally avoids the fragmented/missing dark-pixel artifacts found in the earlier extraction pass.
- No generated asset is stretched or cover-cropped; UI presentation continues to use `object-fit: contain`.

## Compatibility

- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii35`
- Bot runtime compatibility: `1.1.18-recovery-h1`
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **14** unchanged
- Twitch prefix: `!` unchanged

No database migration, player reset, OAuth change, environment variable, or Bot redeploy is required.
