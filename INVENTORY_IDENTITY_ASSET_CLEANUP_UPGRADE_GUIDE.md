# Inventory Identity Asset Cleanup Hotfix — Upgrade Guide

1. Keep the current Bot runtime; this is a Web-only asset hotfix.
2. Deploy the full ii33 Web package, or apply the ii32 → ii33 patch over Inventory Identity Phase 2.
3. Allow the host build to install the pinned frontend dependencies and produce the Vite bundle as usual.
4. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii33`.
5. Clear any stale browser/CDN asset cache if an old corrupted icon remains visible after deployment.
6. Spot-check dark armor, gauntlets/boots, weapon-family icons, Blacksmith Forge Gear, Inventory, Moogle Emporium, and Player Guide item entries.

No database migration, Portal Action protocol change, OAuth reconfiguration, environment-variable change, or player reset is required.
