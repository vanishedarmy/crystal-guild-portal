# Crystal Guild v1.1.19 Retro Phase III RC1 Hotfix 4 — Relic Refresh + Dynamic Camp

## Relic artwork refresh
All eight Relic questlines now use the newly regenerated three-tier weapon progression. Tier 1 is deliberately restrained, Tier 2 adds visible ornamentation, and Tier 3 is the fully legendary final form. Each stage remains a separate transparent PNG and keeps the existing stage-aware routing throughout the Portal and Player Guide.

Relics covered: Gae Bolg, Excalibur, Apocalypse, Godhand, Masamune, Stardust Rod, Nirvana, and Last Knife.

## Stream-aware Camp
Camp now uses a stream-aware base duration in the authoritative Bot runtime:
- Twitch LIVE: 15 minutes.
- Twitch OFFLINE: 1 hour.
- Unknown/unconfirmed Twitch state fails closed to the OFFLINE timer.
- Existing Fellowship/Infirmary Camp-time reductions remain applied to the selected base duration.

The Adventure Board shows whether the currently quoted Camp timer is LIVE or OFFLINE, and the Player Guide/Recovery copy explains the new rule.

## Compatibility
- Web asset revision: `1.1.19-retro-phase-iii14-rc1h4`.
- Bot runtime: `1.1.19-retro-phase-iii-rc1h4`.
- Local database schema: unchanged.
- Hosted sync schema: unchanged.
- Portal Action protocol: 15 unchanged.
- Twitch command prefix: `!` unchanged.
- No player reset, database migration, OAuth reauthorization, or new required environment variables.

Because Camp timing is authoritative in the Bot, deploy both the Web and Bot Hotfix 4 packages.
