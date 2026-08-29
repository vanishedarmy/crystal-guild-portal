# Crystal Guild v1.4.0 — Alpha 2 Web Hotfix 1 Finalization Audit

- Release type: **Web-only presentation hotfix**
- Hosted Web runtime: `1.4.0-dungeons-a2` unchanged
- Frontend asset revision: `1.4.0-dungeons-a2-h1`
- Compatible Bot: `1.4.0-dungeons-a2` unchanged
- Local DB schema: **10**
- Hosted sync schema: **1**
- Portal Action protocol: **24**
- Twitch prefix: `!`

## Scope
- Dungeon Board uses the shared compact disclosure control.
- Closed/open pointer state remains right/down respectively.
- New Dungeon Board art is a real DOM layer and cannot be replaced by the global panel background.
- New art ships only as optimized WebP; no PNG artwork is reintroduced.
- No Dungeon logic, rewards, combat, route choice, persistence, or economy behavior changes.
