# Inventory Identity Phase 2 — Upgrade Guide

1. Keep the current Bot runtime; this is a Web-only visual update.
2. Deploy the full ii32 Web package, or apply the ii31 → ii32 Web patch over Inventory Identity Phase 1.
3. Allow the host build to install the pinned frontend dependencies and produce the Vite bundle as usual.
4. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii32`.
5. Spot-check Inventory, Moogle Emporium, Guild Blacksmith Forge Gear, recipes, item details, and the Player Guide.

No database migration, Portal Action protocol change, OAuth reconfiguration, environment-variable change, or player reset is required.
