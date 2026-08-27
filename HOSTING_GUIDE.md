# Hosting Guide — RC1 Hotfix 8

Deploy this Web package through the same Render/Docker workflow as RC1H7. The Docker build installs frontend dependencies and runs Vite during deployment.

After deployment, `/api/health` should report Web runtime `1.1.19-retro-phase-iii-rc1h8`, frontend asset revision `1.1.19-retro-phase-iii14-rc1h8`, hosted sync schema 1, and Portal Action protocol 18.

RC1H8 is Web-only. The existing RC1H7 Bot remains compatible and does not need to be replaced. No new environment variables, OAuth scopes, or database migration are required.
