# Upgrade Guide — RC1 Hotfix 7 Streamer Inventory Admin

1. Back up the existing player database before deployment as usual.
2. Deploy the matching RC1H7 Web and Bot packages together.
3. No local database migration is required; schema remains **7**.
4. Existing OAuth, Portal sync key, player progression, persistent Adventure results, and Relic art are preserved.
5. Verify `/api/health` reports Web runtime `1.1.19-retro-phase-iii-rc1h7`, frontend revision `1.1.19-retro-phase-iii14-rc1h7`, hosted sync schema 1, and action protocol 18.
6. Sign into `/streamer` using the configured broadcaster Twitch account. Under **Player Inventory**, test a harmless add/remove against a test item stack.
7. Chat-side syntax is `!additem <player> | <item> | [quantity]` and `!removeitem <player> | <item> | [quantity]`.
