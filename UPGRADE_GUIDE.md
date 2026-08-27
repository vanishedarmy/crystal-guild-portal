# Upgrade Guide — RC1 Hotfix 8 Raid Overlay Visual Rework

From RC1 Hotfix 7:

1. Back up your current deployed Web package/configuration as normal.
2. Deploy the RC1H8 Web package or apply the H7 → H8 Web patch.
3. Keep the existing RC1H7 Bot running; Portal Action protocol remains 18.
4. No database migration, environment-variable change, OAuth change, or player reset is required.
5. Verify `/api/health` reports Web runtime `1.1.19-retro-phase-iii-rc1h8`, frontend revision `1.1.19-retro-phase-iii14-rc1h8`, hosted sync schema 1, and action protocol 18.
6. Open `/overlay` in a normal browser and during an active raid to confirm the revised raid HUD.
7. Refresh the OBS Browser Source cache if OBS is still displaying the prior overlay CSS/HTML.

Recommended OBS source behavior is unchanged: use the hosted `/overlay` URL with a transparent Browser Source canvas. The HUD is designed to sit near the upper center of a 16:9 scene while remaining responsive to narrower source sizes.
