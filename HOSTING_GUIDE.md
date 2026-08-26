# Crystal Guild v1.1.18 — Hosted Web Deployment

The hosted Web runtime remains `1.1.18-retro-phase-ii` with frontend asset revision `1.1.18-retro-phase-ii31`, paired with Bot runtime `1.1.18-recovery-h1`.

Deploy the full Web package or the ii30 → ii31 patch. Confirm `/api/health` reports `1.1.18-retro-phase-ii31` after deployment.

Phase 1 item artwork lives in `frontend/public/retro-phase-ii/item-icons-v1/` and contains all 32 canonical consumables as transparent 256×256 WebP assets.

No database migration, hosted sync schema change, Portal Action protocol change, OAuth reconfiguration, environment-variable change, or player reset is required.
