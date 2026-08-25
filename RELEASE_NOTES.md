# Crystal Guild v1.1.18 — Retro Phase II
## Mobile Profile Name No-Wrap Hotfix

This Web-only hotfix corrects long adventurer display names in the mobile player profile masthead. Names now remain on one line beside the Job portrait instead of wrapping into a second line.

### What changed
- Added a mobile-only single-line display-name rule to the player profile masthead.
- Reduced the display-name scale slightly on narrow phone widths while retaining the existing fantasy display type treatment.
- Added graceful ellipsis only as a last-resort fallback for exceptionally long names.
- Preserved portrait sizing, job/level information, status badges, title styling, vitals, and desktop presentation.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii24`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
