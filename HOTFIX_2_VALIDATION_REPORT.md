# Crystal Guild v1.1.17 — Arsenal II Hotfix 2 Validation Report

## Targeted regression coverage

PASS — the shared mobile header renders the Crystal Guild roundel, compact LIVE/OFFLINE token, and hamburger page selector.

PASS — Adventurer Portal, player profiles, Fellowship, Player Guide, Streamer Dashboard, and Privacy Policy now use the shared `SiteHeader` mobile structure.

PASS — the legacy standalone Player Guide masthead was removed so the Guide no longer maintains a competing mobile header.

PASS — the Player Guide retains its separate Guide Sections navigation immediately below the shared site header.

PASS — the mobile header keeps the established scroll-away behavior and remains visible while its hamburger menu is open.

PASS — hosted `/api/health` reports frontend asset revision `1.1.17-arsenal-ii1h2`.

## Automated checks

- Bot regression suite: **377 / 377 PASS**
- Frontend Node tests: **181 / 181 PASS**
- Hosted Web/API tests: **46 / 46 PASS**
- Python compile check for hosted Web runtime: **PASS**

## Compatibility

No gameplay, database, protocol, Twitch command, OAuth, or Bot behavior changed in this hotfix.
