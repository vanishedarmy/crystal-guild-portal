# Hosting Crystal Guild Web v1.1.14 — Cloud Continuity

Use the existing Render Web Service and Docker configuration. Preserve the current Render Environment values. Required production secrets remain `PORTAL_SYNC_KEY`, `PORTAL_TWITCH_CLIENT_ID`, `PORTAL_TWITCH_CLIENT_SECRET`, and `PORTAL_TWITCH_REDIRECT_URI`; do not put real values in GitHub.

Health check: `/api/health`. Public pages include `/players`, `/fellowship`, `/guide`, `/privacy`, `/streamer`, and the transparent OBS Browser Source `/overlay`.

Cloud Continuity adds no new secret. The matching Bot uses the existing `PORTAL_SYNC_KEY` to publish sanitized Fellowship/player/overlay state and manifest heartbeats.
