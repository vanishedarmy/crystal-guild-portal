# Crystal Guild v1.1.19 Retro Phase III RC1 Hotfix 6 — Persistent Adventure Results

## Adventure results no longer disappear while you are away
Portal-origin Adventure Board outcomes now use a durable, player-specific result inbox owned by the authoritative Bot database. A completed Solo Venture or timed Hunt remains available when the player leaves the page, returns later, changes tabs, refreshes the browser, or the Bot process restarts.

Result cards no longer expire on a short timer. Each durable Solo/Hunt result includes a **Confirm Result** action. The result remains visible until the player explicitly confirms it. Multiple unconfirmed results are retained and presented newest-first; confirmation only clears the selected result.

This resolves the case where a timed Hunt finished while the player was away from the Portal and its outcome was gone by the time they returned.

## Streamer Dashboard + backend controls retained
Hotfix 5's Streamer Dashboard redesign remains intact: normal responsive document flow replaces the obstructive locked workspace, broadcaster authorization is compact, and the Streamer Control Center provides owner-authenticated buttons for approved backend commands.

## LIVE-only Portal announcements retained
Portal-origin notable Solo results, Hunt results, and newly unlocked Titles may post to Twitch chat only when the stream is confirmed LIVE. Portal acceptance/intermediate noise remains silent. Chat-origin commands continue using their native chat response behavior.

## Compatibility
- Web runtime: `1.1.19-retro-phase-iii-rc1h6`
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1h6`
- Bot runtime: `1.1.19-retro-phase-iii-rc1h6`
- Local database schema: **7** (automatic additive migration from schema 6 with verified pre-migration backup)
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **17** (paired Web + Bot deployment required)
- Twitch command prefix: `!` unchanged
- Relic Tier 1/2/3 visual refresh remains intact
- Camp remains 15-minute base while LIVE / 1-hour base while OFFLINE
- No player reset, OAuth reauthorization, or new required environment variable
