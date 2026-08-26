# Crystal Guild v1.1.18 — Passive Recovery Hotfix

Adds two automatic recovery paths while preserving the existing Camp, item, and combat systems.

## Long Rest
- Eight hours without an intentional player action triggers an automatic Long Rest refresh, normally within one minute of the threshold.
- Restores full HP and the current Job's MP/AP.
- Clears an ordinary Camp timer so the hero returns READY.
- Intentional Twitch commands and Portal gameplay mutations reset the inactivity timer.
- Passive Portal state polling does not reset the timer.

## Stream Start Refresh
- When Twitch reports a new stream session as LIVE, all registered heroes are refreshed once.
- Full HP and current-Job MP/AP are restored and ordinary Camp timers are cleared.
- The Twitch `started_at` value is persisted as an idempotency key, so repeated live probes and reconnects during the same stream do not heal the roster again.

## Release identity
- Bot runtime: `1.1.18-recovery-h1`
- Web asset revision: `1.1.18-retro-phase-ii30`
- DB schema: 5 unchanged
- Hosted sync schema: 1 unchanged
- Portal Action protocol: 14 unchanged
- Twitch prefix: `!` unchanged
