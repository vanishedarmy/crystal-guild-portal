# Mobile Header & Guide Viewport Hotfix — Validation Report

## Behavior checks
- Phone portrait uses the existing compact shared SiteHeader and hide-on-scroll behavior.
- Phone landscape is explicitly included in mobile header detection using coarse pointer + landscape + low-height viewport criteria.
- Player Guide mobile `Guide Sections` and global search controls are non-sticky and remain in normal page flow.
- Guide navigation drawer remains available as a full-height overlay.
- Landscape Guide hero/header density is reduced.

## Regression validation
- Frontend unit/regression suite: **240/240 PASS**
- Hosted Web/API tests: **46/46 PASS**

## Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii19`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
