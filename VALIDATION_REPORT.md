# Crystal Guild v1.1.18 — Hunt Board Timer Pass Validation

## Guide / Portal contract
- Player Guide Hunt Board now documents Dispatch → Auto Hunt → Wait → Resolve.
- Removed obsolete Round 1 / `!attack` / `!ability` Hunt instructions.
- Current rank timers display as C 15m, B 30m, A 2h, S 5h.
- All 17 Hunt catalog entries use the matching rank timer.
- Hunt catalog badge label changed from `CD` to `Timer`.

## Automated validation
- Frontend test suite: **252/252 PASS**.
- Hosted Web/API test suite: **46/46 PASS**.

## Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii28`
- Compatible Bot runtime: `1.1.18-hunt-board-h1`
- DB schema: 5 unchanged
- Hosted sync schema: 1 unchanged
- Portal Action protocol: 14 unchanged
- Twitch prefix: `!`
