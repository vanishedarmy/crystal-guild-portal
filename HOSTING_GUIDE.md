# Hosting Guide — RC1 Hotfix 9

Deploy the H9 Web and H9 Bot together because Portal Action protocol is **19**. Hosted sync schema remains **1** and the Bot database schema remains **7**.

After deployment, `/api/health` should report Web runtime `1.1.19-retro-phase-iii-rc1h9`, frontend asset revision `1.1.19-retro-phase-iii14-rc1h9`, hosted sync schema 1, and Portal Action protocol 19.

If Render Environment explicitly defines the combat timers, set `ENCOUNTER_JOIN_SECONDS=60`, `ENCOUNTER_ROUND_SECONDS=30`, `RAID_JOIN_SECONDS=90`, and `RAID_ROUND_SECONDS=60`. If those variables are absent, H9 code defaults apply automatically.

OBS continues to use the hosted `/overlay` Browser Source. H9 retains the H8 visual redesign and hides the entire HUD as soon as the raid state becomes inactive.
