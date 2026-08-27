# Hosting Guide — RC1 Hotfix 7

Deploy this Web package using the same Render/Docker workflow as the prior Retro Phase III build. The Docker build installs frontend dependencies and runs Vite during deployment. After deployment, `/api/health` should report Web runtime `1.1.19-retro-phase-iii-rc1h7`, frontend asset revision `1.1.19-retro-phase-iii14-rc1h7`, hosted sync schema 1, and Portal Action protocol 18.

Deploy the paired RC1H7 Bot at the same time. No new environment variables, OAuth scopes, or database migration are required.
