# Upgrade Guide — v1.6.0 Gold Saucer Alpha 3 — MGP

1. Preserve the live database, `.env`, Twitch token/OAuth storage, hosted secrets, and persistent-disk state.
2. Replace the Web source with this full Alpha 3 Web package.
3. Replace the Bot with the matching full Alpha 3 MGP Bot package.
4. Restart/redeploy both services.
5. Verify `!cgversion` reports `1.6.0-gold-saucer-a3`.
6. Verify `/api/health` reports hosted runtime `1.6.0-gold-saucer-a3`, frontend asset revision `1.6.0-gold-saucer-a3`, hosted sync 1, and Portal protocol 27.
7. Open Gold Saucer and confirm the existing balance appears as MGP; Mini Cactpot, Crystal Slots, Monster Toss, Prize Counter, ledger, and recent activity should all use MGP.
8. Confirm an existing player's MGP value is numerically unchanged from their prior Alpha 2 balance.

No database migration or player reset is required. The matching Alpha 3 Bot intentionally preserves the physical schema-12 Gold Saucer balance storage while exposing canonical MGP fields.
