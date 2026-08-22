# Upgrade the Website to Crystal Guild v1.1.14 — Cloud Continuity

1. Back up/commit the current Web repository.
2. Replace/update it with this v1.1.14 Web package.
3. Keep the existing Render environment variables and secrets. Do not commit a real `hosted.env`.
4. Push and let Render redeploy.
5. Confirm `/api/health` reports runtime `1.1.14-cloud-continuity` and frontend `1.1.14-continuity1`.
6. Wait up to one Bot heartbeat and confirm `/fellowship` populates automatically.
7. Open `/overlay`; use that full URL as the OBS Browser Source.
8. Check `/players`, `/guide`, `/privacy`, and `/streamer`.

Deploy the matching v1.1.14 Bot first so Fellowship self-healing and overlay synchronization are active.
