# Hosted Web deployment — Inventory Identity Regeneration R01–R06

Deploy the Web source as usual. No new environment variables or secrets are required.

After deployment, confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii35`, then hard-refresh the Portal once to load the cache-busted item artwork.
