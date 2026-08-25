# Profile Name + Recovery Cleanup Hotfix — Upgrade Guide

1. Deploy the full Web package over the current v1.1.18 Retro Phase II site, or apply the ii26 → ii27 patch.
2. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii27`.
3. Hard-refresh the Adventurer Portal after deployment.
4. Confirm a longer Cinzel character name such as `VanishedArmy` remains on one line in the profile masthead.
5. Open Equipment & Inventory and confirm Recovery lists only items that can currently be used, with a concise recovery summary.
6. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
