# Crystal Guild — Streamer Dashboard

The broadcaster-focused dashboard is available at `/streamer`. It remains separate from the normal viewer Portal navigation.

## Layout

RC1 Hotfix 5 removes the old locked desktop workspace. The dashboard now uses normal document scrolling on desktop, tablet, and mobile so the broadcaster access state never sits over or blocks the roster, activity, or reference areas. The main flow is:

1. Streamer Control Center
2. Roster Watch
3. Guild Pulse (Guild Leaders + Live Ledger)
4. Chat Command Reference
5. Hosted Raid Overlay / OBS reference

The access state is intentionally compact. Signed-out users get a small sign-in prompt; authenticated non-owners get a read-only notice; the verified owner gets controls only while the local Bot relay is connected.

## Streamer Control Center

The verified Twitch owner can execute a strict set of backend actions through Portal Actions. These are typed operations, not a generic command box. The allowlist is: `health`, `economy`, `cgversion`, `encounterdebug`, `directtest`, `fellowshipproject`, `readyall`, `resettimers`, `clearadventures`, `resolveencounter`, `clearencounter`, `spawnboss`, and `resolveboss`.

`economy` accepts a 1–90 day window, `fellowshipproject` accepts the intended project text, and `spawnboss` accepts a boss name. High-impact recovery/force actions use a second-click confirmation before submission. Results are shown directly in the dashboard.

The Chat Command Reference below the controls is still copy-only and remains useful during a live broadcast. Native Twitch owner commands remain supported.

## Security boundary

- The hosted Web receives the owner Twitch ID through the Bot's already-authenticated manifest; it does not need a new owner secret.
- The hosted Web checks the signed-in Twitch ID before accepting `STREAMER_COMMAND`.
- The local Bot checks the owner Twitch ID again before execution.
- Only the explicit allowlist can execute; arbitrary chat text is not relayed.
- OAuth tokens, `PORTAL_SYNC_KEY`, local DB credentials, and Bot secrets are never exposed to the dashboard.

## Live Portal announcements

Selected Portal-origin gameplay results can be announced in Twitch chat only while LIVE. Solo posts are limited to final/notable outcomes and treasure. Portal Hunt acceptance does not post; its timed resolution does. Newly unlocked Titles caused by Portal actions can also post. Offline Portal results stay browser-only. Chat-origin commands retain their normal chat response path.

## Files

Broadcaster page: `frontend/src/pages/StreamerDashboard.jsx`

Broadcaster styles: `frontend/src/styles/streamer.css`

Hosted aggregate/auth/action logic: `crystal_guild/hosted_portal.py`
