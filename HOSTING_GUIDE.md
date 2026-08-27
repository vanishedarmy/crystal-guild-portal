# Hosting Guide — RC1 Hotfix 6

Deploy this Web package using the same Render/Docker workflow as the previous Retro Phase III build. The Docker build installs the frontend dependencies and runs Vite during deployment. After deployment, `/api/health` should report Web runtime `1.1.19-retro-phase-iii-rc1h6`, frontend asset revision `1.1.19-retro-phase-iii14-rc1h6`, hosted sync schema 1, and Portal Action protocol 17.

Deploy/restart the paired RC1H6 Bot at the same time. The Web and Bot action protocol must match. No new Render secret is required; broadcaster authority is supplied by the authenticated Bot manifest from its existing `TWITCH_OWNER_ID`.
