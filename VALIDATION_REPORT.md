# Validation Report — RC1 Hotfix 8 Raid Overlay Visual Rework

## Identity
- Web runtime: `1.1.19-retro-phase-iii-rc1h8`
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1h8`
- Compatible Bot runtime: `1.1.19-retro-phase-iii-rc1h7`
- Portal Action protocol: `18` unchanged
- Hosted sync schema: `1` unchanged
- Local Bot DB schema: `7` unchanged

## Automated validation
- Frontend unit/static regression suite: **291 / 291 passed**.
- Hosted Portal Python suite: **47 / 47 passed**.
- `raid-overlay.js` passes `node --check` syntax validation.

## Overlay-specific coverage
- Hosted `/overlay` remains wired to `/api/overlay/state`.
- Overlay script remains external; no inline executable script was introduced.
- Boss-art routing remains connected to the canonical packaged world/raid boss artwork set.
- Revised markup includes the dedicated boss art panel, boss HP track, Summon meter, and Damage Leaders area.
- Overlay JavaScript renders structured top-damage chips and applies critical-HP, ENRAGED, VICTORY, and WIPE presentation states.
- Reduced-motion CSS remains present.
- Stale/unavailable overlay snapshots still hide the entire HUD.

## Regression continuity
- No action protocol or allowed Portal action change.
- No persistence/database change.
- No Twitch OAuth or environment-variable change.
- RC1H7 Streamer Inventory Admin remains compatible.
- Persistent Adventure results, dynamic Camp, LIVE-only notable Portal announcements, and the regenerated Relic artwork remain packaged unchanged.
