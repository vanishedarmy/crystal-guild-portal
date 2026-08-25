# Crystal Guild v1.1.18 — Retro Phase II
## Profile Name + Recovery Cleanup Hotfix

This Web-only hotfix improves the Cinzel profile masthead fit and simplifies the Adventurer Portal recovery workspace.

### Profile masthead
- Character display names are forced to a single line at desktop and mobile widths.
- Cinzel display names scale down more conservatively before falling back to ellipsis.
- Job portrait, handle, Job/level, title, status, and vitals remain unchanged.

### Equipment, Inventory & Recovery
- Recovery now surfaces only field items that are actually usable at the current moment.
- Removed the redundant “Show usable now” filter and unavailable/battle-only recovery cards.
- Usable items are presented as compact action buttons with owned quantity and a short recovery-effect summary.
- HP/MP/AP gauges, Camp, active-status notices, and action-result feedback remain available.
- The full Inventory sections below remain unchanged for browsing equipment, items, and materials.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii27`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
