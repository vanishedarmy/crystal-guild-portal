# Hosting Crystal Guild Web v1.1.15 — Wayfarer

Use the existing Render Web Service and Docker configuration. Preserve the current Render Environment values. Required production secrets remain `PORTAL_SYNC_KEY`, `PORTAL_TWITCH_CLIENT_ID`, `PORTAL_TWITCH_CLIENT_SECRET`, and `PORTAL_TWITCH_REDIRECT_URI`; do not put real values in GitHub.

Health check: `/api/health`. Public pages include `/players`, `/fellowship`, `/guide`, `/privacy`, `/streamer`, and `/overlay`.

Wayfarer uses hosted sync schema **1** and Portal Action protocol **13**. The new Solo Venture actions use the existing authenticated action queue and `PORTAL_SYNC_KEY`; no new Web secret is introduced. Deploy matching `1.1.15-wayfarer` Bot and Web code so both sides agree on protocol 13 and frontend asset `1.1.15-wayfarer1`.
