# Hosted Web deployment — SNES Gear Regeneration R01–R02

Deploy the Web source as usual. No new environment variables or secrets are required.

After deployment, confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii38`, then hard-refresh the Portal once to load the cache-busted named weapon PNG artwork.

No manual asset deletion is required for ii37 → ii38. The existing Phase 2 shared weapon folders remain intentionally packaged because unregenerated weapons still use them as fallbacks.
