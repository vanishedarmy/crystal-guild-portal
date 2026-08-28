# Alpha 1 Hotfix 2 — Web-only presentation update

If already running Alpha 1 Hotfix 1, deploy only the H2 Web package/patch. Keep the existing `1.2.0-expeditions-a1h1` Bot. No DB migration, OAuth change, environment-variable change, or player reset is required. After deploy, refresh the site/OBS browser cache once so the new Expedition artwork and frontend revision load immediately.

# Upgrade Guide — v1.2.0 Expeditions Alpha 1 Web

Baseline: v1.1.19 RC1 Hotfix 9 Web + Bot.

1. Back up persistent Bot data and the current database.
2. Stop the H9 Bot.
3. Apply the H9 -> v1.2 Bot patch (or full v1.2 Bot package) while preserving `.env`, the database, and token storage.
4. Run `python upgrade_crystal_guild.py`; local DB schema migrates **7 -> 8** with a verified pre-migration backup.
5. Deploy this matching v1.2 Web package or the H9 -> v1.2 Web patch.
6. Start the Bot and confirm Web/Bot both report Portal Action protocol **20**.
7. Verify `/api/health`, the Streamer Dashboard, and a normal existing Adventure Board flow.
8. Test an Emerald Wilds Scout Expedition with a registered Chocobo and completed Fellowship Expedition Board.

Do not deploy the v1.2 Web against an H9 Bot: Expedition Portal actions require protocol 20 and schema 8 on the authoritative Bot.
