# Monster Identity Wave 6 — Validation Report

Prepared from the validated Monster Identity Wave 5 Web baseline.

## Asset and mapping checks
- 10 new Wave 6 monster portraits added: Iron Giant, Iron Giant Exile, Ironclad, Behemoth, Chimera Brain, Evil Eye, Great Malboro, Three Moon Chimera, Death Machine, and Magitek Armor.
- Consolidated monster artwork into cache-busted `monster-portraits-v6`.
- 60 total monster portrait WebP assets packaged.
- All 60 mapped monster IDs exist in the authoritative Player Guide Bestiary data.
- All 60 mapped portrait URLs resolve to real packaged files.
- Solo Venture combat now renders the shared `MonsterPortrait` component for the active enemy.
- New Wave 6 source compositions are proportionally fitted into transparent 512×768 canvases; UI presentation continues using contain-fit rendering.

## Regression validation
- Shared lookup remains authoritative across Bestiary, Hunts, Player Guide, and Solo Venture.
- Frontend asset revision bumped to `1.1.18-retro-phase-ii10` for cache busting.
- No gameplay logic, DB schema, hosted sync schema, OAuth flow, or Portal Action protocol changes were introduced.

## Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii10`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
