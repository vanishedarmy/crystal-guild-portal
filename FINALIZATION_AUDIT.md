# Crystal Guild v1.5.0 — Trails & Raids Alpha 1 Hotfix 1 Finalization Audit

## Frozen hotfix contract
- Hosted Web runtime: `1.5.0-trails-raids-a1h1`
- Frontend asset revision: `1.5.0-trails-raids-a1`
- Compatible Bot: `1.5.0-trails-raids-a1`
- Local DB schema: **10**
- Hosted sync schema: **1**
- Portal Action protocol: **25**
- Web-only deployment: **yes**

## Scope
Hotfix 1 repairs only the hosted Overlay snapshot compatibility contract introduced by Trails & Raids Alpha 1. Raid combat, Ifrit scripting, contribution calculation, Dungeon behavior, economy, rewards, Portal actions, frontend assets, and Bot runtime are unchanged.

## Validation
- **47/47 hosted Web/API PASS**.
- **404/404 frontend PASS** with the unchanged Alpha 1 frontend revision.
- **8/8 hosted Python compile PASS**.
- Alpha 1 mechanic/contribution Overlay payload accepted and persisted by hosted sync.
- Forbidden/private-field protection remains in force.

## Packaging
- Alpha 1 → Hotfix 1 Web delta: **14 changed files, 0 deletions**.
- Final Web tree: **828 files**.
- Alpha 1 → Hotfix 1 Web patch reconstructs **828 / 828** exact files: **PASS**.
- Full Hotfix 1 Web archive matches the frozen **828-file** source tree: **PASS**.
- Release ZIP CRC/integrity: **2 / 2 PASS**.
- Runtime/private-artifact hygiene: **0 violations**.

## Deployment
Deploy only the Hotfix 1 Web package (or Alpha 1 → Hotfix 1 Web patch), then restart/redeploy the hosted Web service. Keep the Alpha 1 Bot and live database unchanged.
