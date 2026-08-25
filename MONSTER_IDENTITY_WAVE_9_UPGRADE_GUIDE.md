# Monster Identity Wave 9 — Upgrade Guide

1. Deploy the full Wave 9 Web package over the current v1.1.18 Retro Phase II site, or apply the Wave 8 → Wave 9 patch.
2. Confirm `frontend/public/retro-phase-ii/monster-portraits-v9/` is published.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii14`.
4. Hard-refresh Bestiary, Hunts, Player Guide, and Adventure Board to clear stale portrait assets.
5. Spot-check Rift Hound, Void Mage, Great Wyrm, Omega Fragment, and Void Avatar.
6. Enter a Solo Venture encounter using an illustrated monster and confirm the enemy portrait remains correctly fitted.
7. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
