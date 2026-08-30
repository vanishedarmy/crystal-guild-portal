# Crystal Guild Web v1.5.0 — Trails & Raids Alpha 1 Hotfix 2

Web-only Player Guide and presentation cleanup on top of Trails & Raids Alpha 1 Hotfix 1.

Hotfix 2 gives **The Riftglass Observatory** the same dedicated Player Guide Dungeon dossier as the other three production delves, including its ten-chamber structure, two Crossroads, weighted Event room, Death Machine miniboss, sanctuary, Crystal Wolf finale, and higher-pressure encounter rules.

It also completely removes the old Retro Environment Pass **gold divider** ornament from the Portal and Player Guide. The CSS rendering hooks and the `gold-divider.webp` asset are removed rather than hidden.

## Runtime identity
- Hosted Web runtime: `1.5.0-trails-raids-a1h1` (unchanged from Hotfix 1)
- Frontend asset revision: `1.5.0-trails-raids-a1h2`
- Compatible Bot: `1.5.0-trails-raids-a1` unchanged
- Local DB schema: **10**
- Hosted sync schema: **1**
- Portal Action protocol: **25**

Deploy Hotfix 2 Web over Hotfix 1 and restart/redeploy the hosted Web service. No Bot update, database migration, reset, OAuth/environment change, or new environment variable is required.
