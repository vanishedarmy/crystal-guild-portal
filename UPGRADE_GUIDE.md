# Upgrade Guide — v1.6.0 Gold Saucer Alpha 2 Canonical Baseline

Supported source: any prior Gold Saucer Alpha 2 Web build with the matching Alpha 2 Bot. For the cleanest reset of the source tree, deploy the full canonical Web package.

1. Preserve the live database, `.env`, Twitch token storage, hosted secrets, and persistent-disk state.
2. Replace the Web source with the full canonical Web package.
3. Keep or replace the Bot with the matching full Alpha 2 Bot package; Bot runtime remains unchanged.
4. Restart/redeploy the services.
5. Verify `!cgversion` reports `1.6.0-gold-saucer-a2`.
6. Verify `/api/health` reports hosted runtime `1.6.0-gold-saucer-a2`, frontend asset revision `1.6.0-gold-saucer-a2h2`, hosted sync 1, and Portal protocol 27.
7. Open Gold Saucer → Monster Toss and confirm there is no standalone image banner above the normal Monster Toss title row. The scenic background and Play Monster Toss start artwork should remain.

No database migration or player reset is required. Schema remains 12.
