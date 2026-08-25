# Mobile Profile Name No-Wrap Hotfix — Upgrade Guide

1. Deploy the full Web package over the current v1.1.18 Retro Phase II site, or apply the ii23 → ii24 patch.
2. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii25`.
3. Hard-refresh a player profile on mobile to clear stale CSS.
4. Confirm a name such as `VanishedArmy` stays on one line beside the Job portrait.
5. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
