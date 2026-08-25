# Crystal Guild v1.1.18 — Hunt Board Timer Pass

The Player Guide Hunt Board now documents the actual autonomous Hunt behavior, and the frontend catalog matches the new authoritative rank timers.

## Updated Hunt Board flow
1. Dispatch an available mark from Adventurer Portal → Adventure Board → Hunt Board, or use `!hunt <name>` while the channel is LIVE.
2. No round-by-round chat combat is required.
3. The hero automatically uses attacks, learned abilities, Defend, and limited survival items.
4. The Hunt resolves automatically when its rank timer expires and then records rewards/results.

## Rank timers
- C: 15 minutes
- B: 30 minutes
- A: 2 hours
- S: 5 hours

## Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii28`
- Compatible Bot runtime: `1.1.18-hunt-board-h1`
- DB schema: 5 (unchanged)
- Hosted sync schema: 1 (unchanged)
- Portal Action protocol: 14 (unchanged)
- Twitch prefix: `!`
