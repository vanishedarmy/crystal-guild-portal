# Upgrade Guide — v1.5.0 Trails & Raids Alpha 1 Hotfix 1

Baseline: **v1.5.0 Trails & Raids Alpha 1 Web + Alpha 1 Bot**. This is a Web-only hotfix.

1. Leave the Alpha 1 Bot, live database, `.env`, Twitch token storage, and local persistent state untouched.
2. Deploy the full Hotfix 1 Web package or apply the **Alpha 1 → Hotfix 1 Web patch**.
3. Restart/redeploy the hosted Web service.
4. Verify `/api/health` reports hosted runtime `1.5.0-trails-raids-a1h1`.
5. Verify `/api/health` still reports frontend revision `1.5.0-trails-raids-a1`, hosted sync schema **1**, and Portal Action protocol **25**.
6. Watch the Bot log through the next sync interval. The prior HTTP 400 `last_mechanic` error should disappear and Portal sync should remain connected.
7. During an Ifrit Trial, verify the Portal/OBS overlay can display the current mechanic, last mechanic, next-round timing, and contribution damage/healing/mitigation/score.

No Bot update, database migration, player reset, OAuth/environment change, or new environment variable is required.
