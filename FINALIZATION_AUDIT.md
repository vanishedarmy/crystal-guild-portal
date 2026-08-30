# Crystal Guild v1.5.0 — Trails & Raids Alpha 1 Hotfix 2 Finalization Audit

## Frozen hotfix contract
- Hosted Web runtime: `1.5.0-trails-raids-a1h1`
- Frontend asset revision: `1.5.0-trails-raids-a1h2`
- Compatible Bot: `1.5.0-trails-raids-a1`
- Local DB schema: **10**
- Hosted sync schema: **1**
- Portal Action protocol: **25**
- Web-only deployment: **yes**

## Scope
Hotfix 2 adds the missing dedicated Riftglass Observatory Player Guide dossier and removes the referenced Retro Environment Pass gold divider from every active Portal/Guide rendering path and from the shipping assets. Raid combat, Hotfix 1 Overlay validation, Dungeon gameplay/progression, economy, rewards, and Portal actions are unchanged.

## Validation
- **406/406 frontend PASS**.
- **47/47 hosted Web/API PASS**.
- **8/8 Python compile**, **201/201 JS/JSX/MJS parser**, **160/160 Node syntax**.
- **149/149** active literal image routes, 0 missing.
- Public artwork: **0 PNG / 575 WebP**.
- Dedicated Hotfix 2 regressions verify Riftglass dossier completeness and total gold-divider removal.

## Packaging
- Hotfix 1 → Hotfix 2 Web delta: **52 changed/new files, 1 deletion**.
- Final Web tree: **828 files**.
- Hotfix 1 → Hotfix 2 patch reconstructs **828 / 828** exact files: **PASS**.
- Full Hotfix 2 Web archive matches the frozen source: **PASS**.
- Release ZIP CRC/integrity: **2 / 2 PASS**.
- Runtime/private-artifact hygiene: **0 violations**.
- SHA-256 verification: **PASS**.

## Deployment
Deploy only the Hotfix 2 Web package (or Hotfix 1 → Hotfix 2 Web patch), then restart/redeploy the hosted Web service. Keep the Alpha 1 Bot and live database unchanged.
