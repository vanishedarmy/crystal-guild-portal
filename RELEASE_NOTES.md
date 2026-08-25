# Crystal Guild v1.1.18 — Retro Phase II
## Mobile Header & Guide Viewport Hotfix

This Web-only hotfix corrects mobile header obstruction in portrait and landscape orientations.

### Changes
- Shared SiteHeader now treats coarse-pointer phone landscape as a mobile viewport even when its CSS width exceeds 720px.
- Compact mobile header remains roundel + LIVE/OFFLINE + hamburger page selection.
- Compact header hides on downward scroll and returns on upward scroll / near the top.
- Player Guide `Guide Sections` toolbar and global search no longer remain permanently sticky on mobile; they scroll naturally with the guide.
- Mobile landscape Player Guide uses reduced hero/header density to preserve usable vertical space.
- Guide drawer becomes a full-height overlay when opened, independent of the scrolled header position.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii19`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
