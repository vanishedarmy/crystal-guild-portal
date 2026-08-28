# Crystal Guild v1.1.19 Retro Phase III RC1 Hotfix 9 — Raid Timing & Field Support

## Raid / overlay fixes
- The hosted OBS raid overlay now hides whenever `active=false`, so a completed VICTORY/WIPE snapshot cannot remain stuck on stream after the raid ends.
- A boss spawned from the authenticated Streamer Portal now stages the same boss/rally Twitch announcement as the owner chat command, but only when Twitch is confirmed LIVE.
- Raid join window default: **90 seconds**.
- Raid round window default: **60 seconds**.

## Rally Venture timing
- Venture rally default: **60 seconds**.
- Venture combat round default: **30 seconds**.
- Existing explicit environment overrides are still honored. The Bot upgrade helper rewrites only the exact prior stock defaults; custom operator values remain untouched.

## Portal timer synchronization
- Adventure Board countdowns now calculate against the Bot-provided `server_now` clock instead of trusting the browser's local wall clock.
- Venture cooldowns, Solo Venture cooldowns, Hunts, Camp, rally closes, and round deadlines therefore remain aligned with Twitch/Bot timing even when the viewer machine clock is ahead or behind.
- The Portal schedules an authoritative refresh at the active encounter round deadline as well as rally/cooldown deadlines.

## LIVE field support
- Eligible field recovery items can target another adventurer outside battle while Twitch is LIVE.
- The Portal Inventory & Recovery panel adds a target username field. Blank remains self-targeted.
- Chat supports `!use <item> | <username>`, `!use <item> on @username`, or `!use <item> @username` outside battle.
- The Bot independently enforces LIVE status for another-player field targeting, verifies the target, blocks recipients currently in battle/Hunt/Solo Venture, and consumes the item from the user only after a useful effect succeeds.
- Active Battle item behavior remains on the existing queued combat-action path.

## Continuity
- Persistent Adventure results and Confirm Result behavior remain intact.
- Streamer inventory administration remains intact.
- Dynamic Camp remains 15 minutes LIVE / 1 hour OFFLINE before Fellowship reductions.
- All 24 regenerated Relic stage PNGs and the H8 raid-HUD visual redesign remain packaged.
- Solo Venture enemy ceiling is now **player level +5**; the lower edge remains roughly player level -2.

## Technical identity
- Web runtime: `1.1.19-retro-phase-iii-rc1h9`
- Frontend revision: `1.1.19-retro-phase-iii14-rc1h9`
- Bot runtime: `1.1.19-retro-phase-iii-rc1h9`
- Portal Action protocol: **19**
- Hosted sync schema: **1**
- Local Bot DB schema: **7**
- Twitch prefix: `!`

No database migration or player reset is required. H9 Web and H9 Bot should be deployed together.
