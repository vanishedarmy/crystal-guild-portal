# Crystal Guild v1.4.0 — Dungeons & Delves Beta 3

## Final Beta hardening

Beta 3 keeps the four-Dungeon feature freeze and combines final shared-state reliability work with a small mobile disclosure correction before release-candidate work.

### Shared-state reliability
- The matching Beta 3 Bot serializes authoritative state-guarded mutations at the SQLite write boundary before reading current Dungeon state.
- Independent Bot/database connections therefore cannot spend the same Dungeon revision concurrently.
- Exact run/chamber/revision binding remains in place, and same action-ID replay remains safe and idempotent.

### Mobile Dungeon Board correction
- On screens **620px and below**, the Dungeon Board title row uses a dedicated two-column layout.
- The disclosure button is pinned to the **right-hand column** instead of wrapping to the left under generic mobile panel rules.
- Pointer state remains **right when closed / down when open**.
- The shared compact disclosure sizing remains unchanged.

### Player guidance
- What's New identifies Beta 3 as the final shared-state hardening pass.
- Player Guide now explains stale-tab behavior in player language: refresh an older tab to obtain the latest Dungeon state; retrying the same pending action remains safe.
- Beta 2 active-run hierarchy, Cache risk blocks, route-effect chips, settlement clarity, and mobile combat layout remain intact.

### Compatibility
- Hosted Web/frontend: `1.4.0-dungeons-b3`
- Compatible Bot: `1.4.0-dungeons-b3`
- Local DB schema: **10** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **25** unchanged
- No DB migration, player reset, OAuth/environment change, new environment variables, or gameplay/economy rebalance.

Deploy Beta 3 Web and Bot together to receive the complete hardening pass.
