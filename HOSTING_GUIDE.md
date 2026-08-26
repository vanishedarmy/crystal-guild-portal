# Hosted Web deployment — SNES Gear Regeneration R05–R10

Deploy the full ii40 Web package as the current hosted Web source, or apply the supplied ii39 → ii40 patch and follow `UPGRADE_GUIDE.md`.

After deployment, confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii40`, then hard-refresh the Portal once to load the cache-busted named weapon PNG artwork.

No database migration, Bot change, OAuth change, environment-variable change, or player reset is required.
