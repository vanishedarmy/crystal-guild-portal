# Hosting Guide — World / Raid Boss Artwork Pass

The hosted Web runtime remains `1.1.18-retro-phase-ii` with frontend asset revision `1.1.18-retro-phase-ii20`, paired with unchanged Bot runtime `1.1.17-arsenal-ii-h4`.

Deploy the full Web package or the ii19 → ii20 patch, then confirm `/api/health` reports `1.1.18-retro-phase-ii20`. The new artwork folder is `frontend/public/retro-phase-ii/boss-art-v1/` and contains all 37 canonical boss images.

After deployment, hard-refresh the Player Guide and Adventurer Portal. If `/overlay` is already loaded in OBS, refresh that browser source as well so the active boss artwork background is picked up.

No Bot deploy, database migration, OAuth reconfiguration, environment-variable change, or player reset is required.
