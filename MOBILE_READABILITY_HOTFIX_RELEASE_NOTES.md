# Crystal Guild v1.1.18 — Retro Phase II
## Mobile Readability Hotfix

This Web-only pass fixes long hero-name wrapping and rebuilds the Adventurer Portal Bestiary presentation for narrow screens.

### Hero directory
- Level and status now share a deliberate top line instead of overlapping card identity content.
- Long display names stay on one line and gracefully truncate only when necessary.
- Full display names remain available through the title tooltip.

### Bestiary
- Desktop/tablet table behavior is retained.
- At phone widths the Bestiary becomes a portrait-led card list instead of compressing six columns into unreadable text.
- Level remains beside the monster identity; Defeats, Weakness, Combat Style, and Active Skill become clearly labeled fields.
- Very narrow phones fall back to a single-column information stack.

No new artwork was necessary; existing job and monster portraits remain the visual anchors.

Frontend asset revision: `1.1.18-retro-phase-ii22`.
No Bot runtime, DB schema, OAuth, hosted sync schema, or Portal Action protocol changes.
