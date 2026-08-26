# Crystal Guild Hosted Web — Inventory Identity Asset Cleanup Hotfix

The hosted Web runtime remains `1.1.18-retro-phase-ii` with frontend asset revision `1.1.18-retro-phase-ii33`, paired with Bot runtime `1.1.18-recovery-h1`.

Deploy the full Web package or the ii32 → ii33 patch. The host should continue installing the pinned frontend dependencies before running the Vite production build. Confirm `/api/health` reports `1.1.18-retro-phase-ii33` after deployment.

The ii33 hotfix replaces the 136 shared Phase 2 material/equipment WebP assets with corrected transparent extractions. If a browser or CDN still shows an ii32 fragmented icon after deployment, purge/refresh the cached asset so the replacement WebP is fetched.

No new environment variables, OAuth settings, database migration, hosted-sync change, Portal Action protocol change, Bot change, or player reset is required.
