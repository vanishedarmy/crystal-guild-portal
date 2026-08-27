# Upgrade Guide — RC1 Hotfix 3 Relic Visuals

1. Back up the currently deployed Web source.
2. Replace it with the full RC1 Hotfix 3 Web package, or apply the included `rc1h2 -> rc1h3` Web patch.
3. Redeploy normally. Render/Docker will install the pinned frontend dependencies and run the Vite production build during deployment.
4. Hard-refresh the Portal once after deployment so the `1.1.19-retro-phase-iii14-rc1h3` asset revision is picked up.
5. Verify the Relic Arsenal, one Relic detail dialog, the Trophy Hall, and Player Guide Relic section show weapon artwork without cropping.
6. No database migration, Bot reset, OAuth change, or environment-variable change is required.
