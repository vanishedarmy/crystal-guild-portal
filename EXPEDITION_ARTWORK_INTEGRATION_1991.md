# Crystal Guild v1.9.91 — Equipment Expansion
## Expedition Bestiary & Material Artwork Integration

This is a **Web merge-over source update**, not a replacement for the entire historical `Web/` public art collection. It extends the previously delivered v1.9.91 Equipment Expansion source and preserves its equipment artwork, Guide, and gameplay interfaces.

### What's new
- 8 new monster portraits (512×768 WebP) under `Web/frontend/public/retro-phase-iii/monster-portraits-v1991/`
- 1 Eclipse Sovereign boss encounter illustration (1280×720 WebP) under `Web/frontend/public/retro-phase-iii/boss-art-v1991/`
- 8 transparent 512×512 material icons under `Web/frontend/public/retro-phase-iii/material-icons-v1/`
- Maps updated in `src/utils/monsterPortraits.js`, `src/utils/bossArtwork.js`, and `src/utils/itemArtwork.js` so Guide and Portal share the artwork paths
- Player Guide text updated for the creatures and expedition materials, with guide cache revision refreshed
- JSON release manifest, plus regression test for this integration

### Installation
1. Back up your existing `Web/` directory.
2. Extract the **Web_Merge.zip** archive into the **parent folder containing your existing `Web/` directory**. Merge files and overwrite the changed source files. Do **not** delete unrelated `Web/frontend/public/` contents (legacy monsters, existing items, cards, backgrounds, etc.).
3. Open PowerShell in the folder containing `package.json` (typically the folder beneath `Web/frontend`, depending on your local project layout).
4. Run `npm install` if you don't have a valid `package-lock.json`; otherwise `npm ci` is appropriate. Then `npm run build`.
5. Deploy the build output with the complete existing public asset collection and these newly added public files.
6. Check the Bestiary, Raid Bosses, inventory, crafting, and Player Guide in browser; verify that the images load without 404 errors.

**No Bot change or database migration is needed.** No combat stats or item behavior changed. Release stays v1.9.91 — Equipment Expansion.

### QA details
- Five focused Node tests passed (`node --test tests/expeditionArtwork1991.test.mjs`).
- 8 monsters + 1 boss + 8 materials are mapped to existing WebP files.
- Material WebPs are RGBA and confirmed transparent. Monster/boss art intentionally has atmospheric backgrounds.
- All 173 previously added equipment artwork routes remain intact.
- A fully compiled production frontend is **not included**: local npm dependency installation did not complete in the available run window. Complete `npm install` (or `npm ci` with the included package-lock) and `npm run build` locally.
- Legacy artwork was intentionally not included in this merge ZIP. Keep the historical `Web/public` files in place.

### Images
See `EXPEDITION_MONSTER_MATERIAL_ARTWORK_MANIFEST.json` for exact item/monster/boss IDs, asset URLs, and SHA-256 checksums.
