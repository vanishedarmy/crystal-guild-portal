# Hosted Web deployment — SNES Item Regeneration R01–R06

Deploy the Web source as usual. No new environment variables or secrets are required.

After deployment, confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii37`, then hard-refresh the Portal once to load the cache-busted SNES/FF-inspired individual PNG artwork.

If updating by overlay instead of replacing the full Web tree, also remove the superseded `item-icons-v2`, `item-icons-v3`, `item-materials-v3`, and `item-materials-v4` directories listed in `PATCH_DELETIONS_FROM_II36.txt`.
