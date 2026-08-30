# Crystal Guild v1.5.0 — Trails & Raids Alpha 1 Hotfix 2

## Player Guide completeness & divider cleanup

### Fixed
- **The Riftglass Observatory** now has a full dedicated entry in **Player Guide → Dungeons & Delves**, matching the first three production Dungeons rather than appearing only in the unlock summary.
- The Riftglass dossier documents its ten chambers, two Crossroads, weighted Event chamber, Death Machine miniboss, sanctuary recovery, Crystal Wolf finale, and higher-pressure encounter rules.
- Removes the referenced gold divider ornament from **all Portal and Player Guide rendering paths**.
- Deletes `frontend/public/retro-phase-ii/environment-pass/gold-divider.webp` from the shipping tree so the removed decoration cannot reappear through stale CSS.
- Frontend asset revision advances to `1.5.0-trails-raids-a1h2` for cache busting.

### Compatibility
- Hosted Web runtime: `1.5.0-trails-raids-a1h1` unchanged from Hotfix 1
- Frontend asset revision: `1.5.0-trails-raids-a1h2`
- Compatible Bot runtime: `1.5.0-trails-raids-a1` unchanged
- Local DB schema: **10** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **25** unchanged
- Player reset / DB migration / Bot update: **none**
- OAuth/environment/new variables: **none**

Deploy only the Web hotfix, then restart/redeploy the hosted Web service.
