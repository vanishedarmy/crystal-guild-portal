# Hosting Guide — RC1 Hotfix 4

Deploy this Web package using the same Render/Docker workflow as the previous Retro Phase III build. After deployment, `/api/health` should report frontend asset revision `1.1.19-retro-phase-iii14-rc1h4`.

For the stream-aware Camp timer, also deploy/restart the paired Bot RC1H4 package. The Portal Action protocol remains 15, so no relay migration is required.
