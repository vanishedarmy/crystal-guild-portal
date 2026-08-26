# Inventory Identity Pass: Phase 1 — Upgrade Guide

1. Back up the currently deployed Web package.
2. Deploy the full ii31 Web package, or apply the ii30 → ii31 patch over the ii30 Passive Recovery Web build.
3. No Bot files need to be replaced for this visual pass.
4. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii31`.
5. Open Inventory, Recovery, Moogle Emporium, an item detail dialog, and the Player Guide item catalog to verify consumable artwork loads.
6. Existing player data is unchanged.
