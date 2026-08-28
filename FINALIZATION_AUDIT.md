# Expeditions Alpha 2 Hotfix 1 Finalization

PASS — Web-only Overview ordering and collapsible board pass. Daily Guild Provisions precedes What's New; What's New is updated for Alpha 2 and collapsible; Distant Expedition Board is collapsible. No DB, hosted sync, or Portal Action protocol changes.

# Finalization Audit — RC1 Hotfix 3 Relic Visuals

## Integration coverage
- Portal Relic Arsenal: stage-aware Relic artwork added.
- Relic detail dialog: stage-aware Relic artwork added.
- Trophy Hall completed Relics: Zenith artwork added.
- Trophy Hall featured Relic trophies: Zenith artwork added.
- Player Guide Relic catalog: Zenith final-form preview added.
- Player Guide Relic stage dossier: Dormant, Awakened, and Zenith reward art added.
- Shared item artwork: all 24 Relic reward-item IDs now route to dedicated Relic assets.

## Asset audit
- 8 Relic lines.
- 3 stages per line.
- 24 PNGs packaged.
- All files are RGBA PNGs with transparent canvas pixels.
- Portal and Guide presentation use `object-fit: contain` to avoid weapon cropping.

## Compatibility audit
- No gameplay logic changes.
- No database migration.
- No hosted sync schema change.
- No Portal Action protocol change.
- No Twitch OAuth/scope change.
- No environment variable changes.

## Test result
- Frontend Node suite: 286 / 286 passing.
- Hosted Portal Python suite: 46 / 46 passing.
