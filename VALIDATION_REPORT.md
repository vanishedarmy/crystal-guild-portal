# Crystal Guild v1.1.18 — Inventory PNG Regeneration R03–R06 Validation

Frontend asset revision: `1.1.18-retro-phase-ii36`.

## Automated regression

- Frontend Node regression suite: **264 / 264 PASS**.
- Hosted Web/API pytest suite: **46 / 46 PASS**.
- Canonical catalog counts preserved: **32 consumables**, **84 materials**, **186 weapons**, **65 armor**, **38 accessories**.

## Artwork validation

- `item-icons-v3`: **32 / 32** packaged individual PNG assets; every file is decodable RGBA, has non-empty alpha content, and is exactly **512×512**.
- `item-materials-v4`: **31 / 31** packaged individual PNG assets; every file is decodable RGBA, has non-empty alpha content, and is exactly **512×512**.
- All 32 live consumables resolve to the cache-busted `item-icons-v3/*.png` library.
- All 31 CG-ITEM-R03 through R06 material concepts resolve through `item-materials-v4/*.png` when addressed by their canonical item ID.
- The live catalog receives dedicated PNG identities where those generated material IDs currently exist; future-use generated materials remain packaged without changing gameplay data.
- Existing Phase 2 equipment mapping remains intact for **186 / 186 weapons**, **65 / 65 armor**, and **38 / 38 accessories**.
- Artwork is normalized onto transparent square canvases with contained scaling; no source asset is stretched or cover-cropped.

## Compatibility

- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii36`
- Bot runtime compatibility: `1.1.18-recovery-h1`
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **14** unchanged
- Twitch prefix: `!` unchanged

No database migration, player reset, OAuth change, environment variable, or Bot redeploy is required.
