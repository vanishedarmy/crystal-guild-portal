# Validation Report — RC1 Hotfix 9 Raid Timing & Field Support

## Identity
- Web runtime: `1.1.19-retro-phase-iii-rc1h9`
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1h9`
- Bot runtime: `1.1.19-retro-phase-iii-rc1h9`
- Portal Action protocol: **19**
- Hosted sync schema: **1**
- Local Bot DB schema: **7**

## Automated validation
- Frontend Node regression suite: **291 / 291 passed**.
- Hosted Portal Python suite: **47 / 47 passed**.
- Bot suite: **408 tests plus 30 subtests passed**.
- Changed Python modules pass `py_compile`.
- `raid-overlay.js` passes `node --check`.

## H9-specific coverage
- Overlay source explicitly hides on any inactive raid state.
- Portal Adventure timers use a Bot `server_now` offset and include round deadlines in authoritative refresh scheduling.
- Portal `USE_FIELD_ITEM` accepts only an optional sanitized Twitch target username in addition to item ID.
- Bot field-item support tests verify another player can be healed while LIVE and that the same cross-player action fails closed OFFLINE without consuming the item.
- Bot timer tests verify Venture rally/round defaults 60s/30s and Raid rally/round defaults 90s/60s.
- Portal boss-spawn regression verifies the LIVE owner Portal path publishes the rally announcement after hosted acknowledgement and remains silent when OFFLINE.
- Upgrade-helper regression verifies only the prior stock timer values are rewritten; unrelated/custom values remain intact.
- Solo Venture state and selection now expose/enforce a **+5 maximum enemy level offset**.

## Continuity
- No DB schema migration.
- Persistent Solo/Hunt result inbox remains intact.
- Streamer inventory admin remains intact.
- Dynamic Camp and Relic visuals remain intact.
- Solo Venture max enemy offset is **+5**.
