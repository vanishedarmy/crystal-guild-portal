# Upgrade Guide — iii11 to iii12 Facility Supply Balance

1. Deploy the full iii12 Web package or apply the iii11 → iii12 Web patch.
2. Deploy the matching Facility Supply Balance Bot package/patch; the drop tables are authoritative on the Bot.
3. Preserve the live database, environment variables, Twitch tokens, and Portal sync key.
4. No database, player-data, Portal Action, hosted-sync, OAuth, or environment migration is required.
5. Verify `/api/health` reports Web runtime `1.1.19-retro-phase-iii` and frontend revision `1.1.19-retro-phase-iii12`.
6. Hard-refresh once after deployment and inspect the Player Guide Bestiary for the new material drop sources.
