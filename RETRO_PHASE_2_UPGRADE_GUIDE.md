# Crystal Guild v1.1.18 — Retro Phase 2 Upgrade Guide

Upgrade baseline: **v1.1.18 — Retro Phase 1 Hotfix 1**.

Retro Phase 2 is a **Web-focused update**. Keep the existing Bot exactly as-is.

1. Preserve the hosted Web service environment variables and private/runtime state as normal.
2. Apply `CrystalGuild-v1.1.18-Retro-Phase2-Web-Patch-from-Retro-Phase1-Hotfix1.zip` over the current Retro Phase 1 Hotfix 1 Web source, or replace the Web source with the full Retro Phase 2 Web package.
3. Push/deploy the updated Web source.
4. **Do not replace, migrate, reset, or redeploy the Bot.**
5. Verify hosted `/api/health` reports Web runtime `1.1.18-retro-phase-2` and frontend revision `1.1.18-retro-phase2`.
6. Open Guild Heroes and confirm Job crests appear without changing hero ordering.
7. Open a character profile and confirm the header Job crest, equipment icons, and existing HP/MP/AP information remain readable.
8. Open Adventure Board and confirm all region cards load their art, locked art is subdued, and Travel controls retain the same behavior.
9. Open Hunts / Solo Venture and confirm monster tokens do not displace the action controls; resolve treasure when practical and confirm the chest visual fits the result card.
10. Open Bestiary and confirm discovered entries receive tokens while undiscovered entries remain anonymous.
11. Open `/overlay` during an active raid and confirm the Retro battle window remains readable in OBS/browser source sizing.
12. Check phone width for the compact header, region art cropping, Hunt cards, Bestiary table, and treasure result reflow.
13. Open Overview → What's New → Previous major updates and confirm the major update monikers are listed through Retro Phase 2.

No SQLite edits or migration commands are required. Existing player progression is preserved.
