# Upgrade Guide — v1.5.0 Trails & Raids Alpha 1 Hotfix 2

Baseline: **v1.5.0 Trails & Raids Alpha 1 Hotfix 1 Web + Alpha 1 Bot**. This is a Web-only presentation hotfix.

1. Leave the Alpha 1 Bot, live database, `.env`, Twitch token storage, and persistent state untouched.
2. Deploy the full Hotfix 2 Web package or apply the **Hotfix 1 → Hotfix 2 Web patch**.
3. Restart/redeploy the hosted Web service.
4. Verify `/api/health` reports hosted runtime `1.5.0-trails-raids-a1h1`, frontend revision `1.5.0-trails-raids-a1h2`, hosted sync schema **1**, and Portal Action protocol **25**.
5. Open **Player Guide → Dungeons & Delves** and confirm The Riftglass Observatory has its own Dungeon card with Death Machine and Crystal Wolf details.
6. Check Portal panels and Player Guide section headings and confirm the old gold divider ornament is no longer rendered anywhere.
7. Confirm Portal sync remains connected; Hotfix 1's Trial/Raid Overlay validator repair is retained unchanged.

No Bot update, database migration, player reset, OAuth/environment change, or new environment variable is required.
