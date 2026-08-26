# Upgrade — ii37 to ii38

1. Deploy the full Web package over `1.1.18-retro-phase-ii37`, or overlay the supplied ii37 → ii38 patch.
2. No files require manual deletion for this checkpoint; the older shared weapon families remain in use as fallbacks.
3. No database migration, Bot update, OAuth reconfiguration, environment-variable change, or player reset is required.
4. Confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii38`.
5. Hard-refresh the Portal once so the new named weapon PNG mappings are loaded.
