# Crystal Guild v1.4.0 — Dungeons & Delves Beta 2

## Dungeon UX & Mobile Consolidation — Web-only

Beta 2 keeps the v1.4 Dungeon feature set frozen at four delves and focuses on player-facing clarity. The authoritative Dungeon rules, rewards, persistence, exact run/chamber/revision action contract, schema, and Portal protocol are unchanged from Beta 1.

### Active delve hierarchy
- Adds a compact run-status row for chamber progress, Dungeon identity, current state, and retreat value.
- Separates the carried Dungeon Cache from room copy and labels it clearly as at-risk progress.
- Keeps discoveries and pending route consequences close to the current room without repeating rules text.

### Route and settlement clarity
- Crossroads consequences render as individual effect chips instead of one dense sentence.
- Result reports explicitly identify the Cache settlement rate and explain what was banked.
- Active runs keep the full settlement rule visible: **clear 100% / retreat 50% / defeat 25%**.
- Retreat confirmation now states exactly what will be banked and what will be left behind.

### Dungeon Board cleanup
- Dungeon cards consolidate entry/recommended level, chamber length, route/event count, and personal record into four readable blocks.
- Existing first-clear state, unlock requirements, scene artwork, and clear records remain unchanged.

### Mobile consolidation
- Dungeon cards and route choices collapse to a single-column flow on narrow screens.
- Active-run status and Cache blocks use compact two-column layouts where space allows.
- Dungeon combat actions use a stable two-column touch layout on phones instead of a crowded horizontal row.
- Results and retreat controls become full-width where that improves touch readability.

### Compatibility
- Compatible Bot runtime: `1.4.0-dungeons-b1` — unchanged
- Hosted Web runtime: `1.4.0-dungeons-b2`
- Frontend asset revision: `1.4.0-dungeons-b2`
- Local DB schema: **10** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **25** unchanged
- Twitch prefix: `!`
- Database migration: **none**
- Player reset: **none**
- OAuth/environment changes: **none**
- New environment variables: **none**
- Gameplay/economy/balance changes: **none**

Beta 2 is a **Web-only update**. The existing Beta 1 Bot remains the compatible authoritative runtime.
