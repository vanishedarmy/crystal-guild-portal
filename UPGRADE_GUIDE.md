# Crystal Guild v1.1.18 — Inventory Identity Cache-Bust Hotfix Upgrade Guide

1. Keep the existing Bot runtime and player database unchanged.
2. Deploy the full ii34 Web package, or apply the ii33 → ii34 Web patch over the current Inventory Identity Asset Cleanup build.
3. Rebuild/redeploy the hosted Web app normally.
4. Confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii34`.
5. Open an equipment/inventory view. Phase 2 item art now resolves from new `-v2` URLs, so no manual browser cache purge should be required.

No database migration, OAuth change, environment-variable change, Portal Action protocol change, or player reset is required.
