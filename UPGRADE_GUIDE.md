# Inventory Identity Asset Cleanup Hotfix — Upgrade Guide

1. Keep the current Bot runtime; this is a Web-only visual asset hotfix.
2. Deploy the full ii33 Web package, or apply the ii32 → ii33 patch over the current Inventory Identity Phase 2 Web build.
3. Let the hosting build install the pinned frontend dependencies and build normally.
4. Confirm `/api/health` reports `1.1.18-retro-phase-ii33`.
5. If an old icon remains after deployment, clear the browser/CDN cache so the replacement WebP is fetched.
6. Spot-check Inventory, Moogle Emporium, Player Guide items, recipes, and Forge Gear—especially dark armor and thin weapon silhouettes.

No database migration, Portal Action protocol change, OAuth reconfiguration, environment-variable change, or player reset is required.
