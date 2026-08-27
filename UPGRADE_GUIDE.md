# Upgrade Guide — v1.1.19 Retro Phase III RC1 Hotfix 1

Baseline: **v1.1.19 Retro Phase III RC1 / frontend iii14-rc1**.

This is a **Web-only** correction.

1. Leave the RC1 Bot deployment unchanged.
2. Replace the hosted Web source with the RC1 Hotfix 1 Web package, or apply the `iii14-rc1 -> iii14-rc1h1` Web patch.
3. If applying the patch as an overlay, remove `frontend/public/retro-phase-iii/scene-backgrounds-v1/` as listed in `DELETE_PATHS.txt`.
4. Push/redeploy the hosted Web service.
5. Verify `/api/health` still reports runtime `1.1.19-retro-phase-iii-rc1` and now reports frontend revision `1.1.19-retro-phase-iii14-rc1h1`.
6. Open Camp & Recovery, Blacksmith, Chocobo Stable, and Moogle Emporium and confirm each has a visibly rendered scene behind the upper workspace.
7. Check one phone-width layout and confirm the scene does not stretch through the entire tall page.

No schema migration or player-data change is required.
