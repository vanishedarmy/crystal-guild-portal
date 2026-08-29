# Crystal Guild v1.4.0 — Dungeons & Delves Alpha 2 Web Hotfix 1

## Web-only Dungeon Board visual fix

This hotfix builds directly on **Dungeons & Delves Alpha 2** and changes presentation only. The compatible Alpha 2 Bot, database schema, hosted sync schema, and Portal Action protocol are unchanged.

### Dungeon Board background
- Adds the new wide crystal-dungeon scene to the Dungeon Board.
- The artwork is rendered as a real DOM image layer inside the panel, so the global `.panel` background cannot override or hide it.
- A dedicated readability veil keeps headings, dungeon cards, and controls legible while allowing the environment artwork to remain clearly visible.
- Source PNG: **1,964,168 bytes**; shipping WebP: **183,336 bytes**, saving **1,780,832 bytes (90.7%)**.
- Shipping dimensions remain **2172×724**.

### Dungeon Board collapse pointer
- Replaces the Dungeon Board's local `adventure-collapse-toggle` treatment with the same shared `section-collapse-button` used by Travel Regions, Hunt Board, Expedition Board, and What's New.
- The control now renders in the canonical **38px button box** instead of inheriting the oversized generic button/image treatment.
- Pointer state remains authoritative: **right hand when closed, down hand when open**.
- Removes the large gray/raw-image-tile appearance reported on the Dungeon Board.

### Compatibility
- Hosted Web runtime: `1.4.0-dungeons-a2` unchanged
- Frontend asset revision: `1.4.0-dungeons-a2-h1`
- Compatible Bot runtime: `1.4.0-dungeons-a2` unchanged
- Local DB schema: **10** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **24** unchanged
- Twitch prefix: `!`
- Bot update: **not required**
- Database migration/player reset: **none**
- OAuth/environment changes: **none**
- Gameplay/economy/balance changes: **none**
