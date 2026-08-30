# Crystal Guild v1.4.0 — Dungeons & Delves Alpha 3 Finalization Audit

## Identity
- Hosted Web runtime: `1.4.0-dungeons-a3`
- Frontend asset revision: `1.4.0-dungeons-a3`
- Compatible Bot: `1.4.0-dungeons-a3`
- Local DB schema: **10**
- Hosted sync schema: **1**
- Portal Action protocol: **24**

## UI continuity
- Dungeon Board retains the real DOM background-art layer introduced in Alpha 2 H1.
- Shared disclosure pointers remain normalized and state-driven: right when closed, down when open.
- Public artwork remains WebP-only; no PNG artwork is shipped.
- Previous major updates remains stable-release-only below the current Alpha 3 card.

## Release hygiene
No `.env`, database, token JSON, cache, log, or other runtime-private state is included in release packages.
