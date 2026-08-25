# Crystal Guild v1.1.18 — Retro Phase II Upgrade Guide

Upgrade baseline: **v1.1.18 — Retro Phase 1 Hotfix 1**.

Retro Phase II is Web-only. Keep the current Bot exactly as-is.

1. Preserve the hosted Web service environment variables and private/runtime state as normal.
2. Apply `CrystalGuild-v1.1.18-Retro-Phase-II-Web-Patch-from-Retro-Phase1-Hotfix1.zip` over the current Retro Phase 1 Hotfix 1 Web source, or replace the Web source with the full Retro Phase II Web package.
3. Push/deploy the updated Web source.
4. Do **not** replace or redeploy the Bot.
5. Verify hosted `/api/health` reports Web runtime `1.1.18-retro-phase-ii` and frontend revision `1.1.18-retro-phase-ii4`.
6. Open **Adventure Board → Regions** and confirm all eight live regions show their own standalone scene.
7. Confirm locked destinations dim the scene without obscuring requirements or controls.
8. Check the Player Guide region section and confirm it uses the same destination artwork.
9. Check desktop and mobile widths for clean 16:9 artwork crops and aligned Travel controls.
10. Open **What's New** and confirm the major-update archive includes the established monikers through Retro Phase II.

No schema migration or manual SQLite edit is required. Player progression is preserved.
