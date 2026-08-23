Crystal Guild v1.1.14 — Hosted Overlay Render Fix

Problem:
The hosted overlay HTML contained inline JavaScript. Crystal Guild's production CSP correctly blocks inline scripts (`script-src 'self'`), so the overlay panel remained display:none even when /api/overlay/state reported an active boss.

Fix:
- Moves overlay JavaScript into frontend/public/raid-overlay.js.
- Loads it from /raid-overlay.html as a same-origin external script, which is permitted by the existing CSP.
- No Bot, database, sync protocol, OAuth, Render secret, or player-state changes.

Deploy:
Overlay this patch onto the v1.1.14 Web repository, commit, push, and let Render redeploy.
Then hard-refresh /overlay. No Bot restart is required.
