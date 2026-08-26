# Crystal Guild Hosted Web — ii34 Deployment Note

Deploy the full Web package or the ii33 → ii34 patch. The host should continue installing the pinned frontend dependencies before running the Vite production build.

Confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii34` after deployment.

The ii34 cache-bust moves the corrected shared Phase 2 item/equipment artwork to new `-v2` public URLs. This is deliberate: it prevents browsers or upstream static caches from reusing the old corrupted ii32 artwork that shared the previous `-v1` URLs. No manual asset-cache purge should be necessary once the ii34 frontend is live.
