# Monster Identity Wave 6 — Upgrade Guide

1. Deploy the full Web package over the current v1.1.18 Retro Phase II hosted Web build, or apply the Wave 5 → Wave 6 patch.
2. Confirm `frontend/public/retro-phase-ii/monster-portraits-v6/` is published.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii10`.
4. Refresh the Adventure Board, Bestiary, Hunts, and Player Guide so the cache-busted v6 monster portrait URLs load.
5. Spot-check Iron Giant, Behemoth, Evil Eye, Great Malboro, and Magitek Armor.
6. Start a Solo Venture combat encounter and confirm the enemy portrait appears in the enemy panel. Earlier illustrated monsters such as Basilisk should also display correctly.
7. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
