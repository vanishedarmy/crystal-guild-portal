# Crystal Guild Web v1.5.0 — Trails & Raids Alpha 1 Hotfix 1

Web-only compatibility hotfix for the Trails & Raids Alpha 1 hosted Overlay sync path. Alpha 1 correctly emits sanitized Trial mechanic and contribution fields, but the original hosted validator retained the older v1.4 Overlay allowlist and rejected the new fields with HTTP 400.

Hotfix 1 expands the hosted Overlay contract to accept the already-sanitized Alpha 1 fields used by the live Raid Board and OBS overlay: encounter type/name, current/last mechanic, next-round timestamp, mitigation, and weighted contribution score. It does not alter raid combat, rewards, Dungeon behavior, Portal actions, or frontend assets.

## Runtime identity
- Hosted Web runtime: `1.5.0-trails-raids-a1h1`
- Frontend asset revision: `1.5.0-trails-raids-a1` unchanged
- Compatible Bot: `1.5.0-trails-raids-a1` unchanged
- Local DB schema: **10**
- Hosted sync schema: **1**
- Portal Action protocol: **25**

Deploy Hotfix 1 Web over Alpha 1 and restart/redeploy the hosted Web service. No Bot update, database migration, reset, OAuth/environment change, or new environment variable is required.
