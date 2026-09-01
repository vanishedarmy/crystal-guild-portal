# Portal Actions — Gold Saucer Alpha 5

Portal Action protocol is **29**. Alpha 5 adds `TRIAD_SET_DECK`, `TRIAD_START`, and `TRIAD_PLAY`; the local Bot remains authoritative for all Gold Saucer MGP debit/payout, daily limits, card collection, board state, and replay receipts.

Hosted runtime/Bot and frontend asset revision are `1.6.0-gold-saucer-a5`. Hosted sync remains 1. The Web continues to prefer canonical MGP fields and accepts legacy `points` aliases for balance compatibility.

Triple Triad payloads are tightly bounded by the hosted relay before they enter the action queue: exactly five unique card IDs for deck changes, one known opponent ID for start, and one card ID plus board cell 0–8 for play.
