# Upgrade Guide — RC1 Hotfix 6 Persistent Adventure Results

1. Back up the existing Crystal Guild local database before deployment as normal. The Bot also creates and verifies an automatic `pre_schema_7_*.db` backup before the additive schema migration.
2. Deploy the RC1H6 Web package or apply the Web H5 → H6 patch.
3. Deploy the paired RC1H6 Bot package or Bot patch. Both sides must use Portal Action protocol **17**.
4. Start the Bot and verify the local database reports schema **7**. Existing player data is migrated in place; no reset is required.
5. Verify `/api/health` reports Web runtime `1.1.19-retro-phase-iii-rc1h6`, frontend revision `1.1.19-retro-phase-iii14-rc1h6`, hosted sync schema 1, and action protocol 17.
6. Open the Adventure Board. Complete a Portal Solo Venture or Portal-origin Hunt, leave the page, and return. The result should still be visible with **Confirm Result**.
7. Confirm the result. Only that selected card should clear; other pending results remain.
8. Verify `/streamer` still shows the compact Streamer Control Center and that LIVE-only Portal result announcements behave as expected.

No OAuth reauthorization or new environment variable is required.
