# Upgrade Guide — Gold Saucer Alpha 1 Web Hotfix 1

Supported baseline: **v1.6.0 Gold Saucer Alpha 1 Web**.

1. Leave the Alpha 1 Bot, live database, `.env`, Twitch tokens, hosted secrets, and persistent state untouched.
2. Apply `CrystalGuild-v1.6.0-Gold-Saucer-Alpha1-Web-Hotfix1-Visuals-Patch.zip` from the Web project root using its included `apply_patch.py`, or replace the Web tree with the full H1 Web package.
3. Rebuild/redeploy the Web service normally.
4. Hard-refresh once after deployment.
5. Open Gold Saucer and verify the Lobby, Mini Cactpot, Crystal Slots, and Prize Counter scenic art appears; spin Crystal Slots and confirm individual symbol art appears on the reels.

No Bot deployment or database migration is required.
