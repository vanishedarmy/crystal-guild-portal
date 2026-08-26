# Crystal Guild Hosted Web — Inventory Identity Phase 2

The hosted Web runtime remains `1.1.18-retro-phase-ii` with frontend asset revision `1.1.18-retro-phase-ii32`, paired with Bot runtime `1.1.18-recovery-h1`.

Deploy the full Web package or the ii31 → ii32 patch. The host should continue installing the pinned frontend dependencies before running the Vite production build. Confirm `/api/health` reports `1.1.18-retro-phase-ii32` after deployment.

No new environment variables, OAuth settings, database migration, hosted-sync change, Portal Action protocol change, or player reset is required.
