# Upgrade — Hotfix 5 Gear Favorites Authority Fix

**Deploy the matching Bot and Web together.** Local schema advances **15 → 16** and Portal Action protocol advances **32 → 33**. The Bot performs the additive database migration and verified pre-migration backup automatically.

The Web now uses the Bot-synced player snapshot as the canonical Favorites list. The hosted preference row is only a pending/migration bridge, and public inventory APIs remove the private favorite IDs. Existing browser-local or prior hosted-only Favorites are migrated into the player database automatically when encountered.

Preserve the live player database, Twitch tokens, secrets, and persistent runtime files. No player reset is performed and hosted sync schema remains **1**.
