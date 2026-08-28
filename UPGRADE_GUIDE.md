# Upgrade Guide — RC1 Hotfix 9 Raid Timing & Field Support

Baseline: RC1H8 Web + RC1H7 Bot. H8 was Web-only, so H9 moves both sides to one paired protocol/runtime checkpoint.

1. Back up the current database and persistent Bot data.
2. Stop the Bot.
3. Apply the H7 → H9 Bot patch (or replace with the full H9 Bot package), preserving `.env`, database, and Twitch token database.
4. Run `python upgrade_crystal_guild.py`. It preserves custom timer overrides, but rewrites the exact old stock values 45/20/60/15 to the new 60/30/90/60 defaults.
5. If the four combat timers are explicitly configured in Render Environment, set them to:
   - `ENCOUNTER_JOIN_SECONDS=60`
   - `ENCOUNTER_ROUND_SECONDS=30`
   - `RAID_JOIN_SECONDS=90`
   - `RAID_ROUND_SECONDS=60`
6. Deploy the H9 Web package or H8 → H9 Web patch.
7. Start the H9 Bot and verify Web/Bot both report Portal Action protocol 19.
8. Spawn a test boss from the Streamer Portal while LIVE: confirm the Twitch rally call appears and the raid join countdown is 90s.
9. Resolve/win the test raid and confirm `/overlay` clears immediately after the inactive final state reaches the Web.
10. Start a Rally Venture: confirm 60s rally and 30s rounds, and compare Portal countdown to Twitch chat.
11. During a LIVE stream, damage a test hero and use an eligible field recovery item on that hero from Inventory & Recovery (or `!use potion | username`).

No DB migration is required; schema remains 7. Existing player progression is preserved.
