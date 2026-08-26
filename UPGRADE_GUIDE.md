# Upgrade — ii36 to ii37

1. Deploy this Web package over the current `1.1.18-retro-phase-ii36` deployment, or apply the supplied ii36 → ii37 patch.
2. Ensure deleted superseded asset directories are removed from the deployed tree; do not leave stale `item-icons-v2/v3` or `item-materials-v3/v4` folders behind.
3. Rebuild/redeploy the frontend normally.
4. Confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii37`.
5. Hard-refresh once so the new cache-busted art paths are loaded.

No database migration, Bot update, OAuth reconfiguration, or player reset is required.
