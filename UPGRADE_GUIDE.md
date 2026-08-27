# Upgrade Guide — iii8 to iii9

1. Replace the web build with the iii9 package, or apply the iii8→iii9 patch.
2. Ensure the following files now exist under `frontend/public/retro-phase-ii/elemental-crystals-v2/`:
   - dark.png
   - earth.png
   - fire.png
   - ice.png
   - light.png
   - lightning.png
   - water.png
   - wind.png
3. Confirm that the old `.webp` files are no longer present in that folder.
4. Confirm `frontend/src/utils/itemArtwork.js` routes elemental assets to `.png` files.
5. Rebuild/redeploy the frontend so cached artwork references are refreshed.
