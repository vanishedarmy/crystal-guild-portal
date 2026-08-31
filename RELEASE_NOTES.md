# Crystal Guild v1.6.0 — Gold Saucer Alpha 3 — MGP

## Canonical MGP terminology
- Renames the temporary player-facing Gold Saucer **SP / Saucer Points** label to **MGP — Manderville Gold Saucer Points**.
- Gold Saucer balance, attraction costs, payouts, Prize Counter, ledger, recent activity, Player Guide, What's New, and streamer controls now display MGP.
- The Web consumes canonical Alpha 3 `mgp`, `daily_allowance_mgp`, and `records.net_mgp` fields.
- Alpha 2 `points`, `daily_allowance_points`, and `records.net_points` remain supported as compatibility fallbacks during deployment.

## Economy preservation
- Existing stored Gold Saucer balances are preserved exactly.
- Welcome purse remains **500 MGP**.
- Daily floor remains **50 MGP**.
- Mini Cactpot remains **10 MGP**.
- Crystal Slots remains **15 MGP**.
- Monster Toss remains **20 MGP** per game.
- No payout, odds, Prize Counter cost, ownership, record, or daily-limit rebalance.

## Compatibility
- Hosted runtime: `1.6.0-gold-saucer-a3`
- Frontend asset revision: `1.6.0-gold-saucer-a3`
- Compatible Bot: `1.6.0-gold-saucer-a3`
- Local DB schema: **12** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **27** unchanged
- Twitch prefix: `!`
- Existing Alpha 2 Monster Toss artwork remains under `/gold-saucer/a2h2/monster-toss/`.
