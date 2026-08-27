# Crystal Guild v1.1.19 — Retro Phase III / Release Candidate 1

RC1 closes out the Retro Phase III visual program and prepares Crystal Guild for the v1.2 Expeditions branch.

## Scenic background pass
Four new SNES/FF-style scene backgrounds add atmosphere to high-value Portal spaces without replacing their existing controls:
- **Camp & Recovery** — twilight crystal-forest campsite; shared by Adventure Board Camp and Inventory Recovery.
- **Blacksmith** — ember-lit medieval forge.
- **Chocobo Stable** — bright countryside stable.
- **Moogle Emporium** — stocked fantasy apothecary/merchant interior.

The scenes are stored under `frontend/public/retro-phase-iii/scene-backgrounds-v1/` as optimized 1440×810 PNGs. Dark gradient overlays preserve contrast, mobile opacity is reduced, and `prefers-contrast: more` further suppresses the artwork.

## Final artwork/path audit
- Explicit `/retro-phase-*` image routes were checked against the packaged public tree.
- No broken explicit routed assets were found.
- Chocobo portraits, item/weapon art, material art, gear families, monster art, regions, bosses, Jobs, and character portraits remain in place.

## Cleanup
- Removed obsolete prior patch-deletion manifests from the Web root.
- Removed the redundant text copy of the gear-art manifest while retaining the JSON audit/manifests.
- Removed runtime/build caches from the shipping tree.

## Compatibility
- Hosted Web runtime: `1.1.19-retro-phase-iii-rc1`
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1`
- Paired Bot runtime: `1.1.19-retro-phase-iii-rc1`
- Local DB schema: **6**
- Hosted sync schema: **1**
- Portal Action protocol: **15**
- Player reset: **none**
- OAuth change: **none**
- New environment variables: **none**
