# Hosted Web deployment — ii39

Deploy the full package or overlay the ii38 → ii39 patch on the hosted Web service. If using the patch, remove `frontend/public/retro-phase-ii/weapon-icons-v3/`; ii39 replaces it with `weapon-icons-v4/`.

After deployment, confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii39`, then hard-refresh the Portal once to load the cache-busted named weapon PNG artwork.

No database migration, Bot update, OAuth change, environment-variable change, or player reset is required.
