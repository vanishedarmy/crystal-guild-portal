# Hosting Crystal Guild Web v1.1.16 — Arsenal

Use the existing Render Web Service and Docker configuration. Preserve the current Render Environment values. Required production secrets remain `PORTAL_SYNC_KEY`, `PORTAL_TWITCH_CLIENT_ID`, `PORTAL_TWITCH_CLIENT_SECRET`, and `PORTAL_TWITCH_REDIRECT_URI`; do not put real values in GitHub.

Health check: `/api/health`. Public pages include `/players`, `/fellowship`, `/guide`, `/privacy`, `/streamer`, and `/overlay`.

Arsenal uses hosted sync schema **1**, hosted sync compatibility **1.1.15-wayfarer**, and Portal Action protocol **14**. No new Web secret is introduced. Deploy matching `1.1.16-arsenal` Bot and Web code so gameplay content and frontend asset `1.1.16-arsenal1` stay aligned.
