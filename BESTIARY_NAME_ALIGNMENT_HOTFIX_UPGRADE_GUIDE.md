# Bestiary Name Alignment Hotfix — Upgrade Guide

1. Deploy the full Web package over the current v1.1.18 Retro Phase II site, or apply the ii22 → ii23 patch.
2. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii25`.
3. Hard-refresh the Adventurer Portal Bestiary on mobile to clear stale CSS.
4. Spot-check Goblin, Wolf, and Mandragora entries on a phone viewport and confirm the name text starts to the right of the portrait.
5. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
