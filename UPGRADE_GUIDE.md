# Upgrade Guide — Crystal Guild v1.4.0 Dungeons & Delves RC1

Baseline: **Dungeons & Delves Beta 3 Web + Bot**.

1. Preserve the existing database, `.env`, Twitch token storage, and hosted secrets.
2. Apply the Beta 3 → RC1 Web patch or deploy the full RC1 Web package.
3. Apply the Beta 3 → RC1 Bot patch or deploy the full RC1 Bot package.
4. Redeploy/restart Web and Bot together.
5. Verify `/api/health` reports Web/frontend `1.4.0-dungeons-rc1`, hosted sync schema **1**, and protocol **25**.
6. Verify `!cgversion` reports Bot `1.4.0-dungeons-rc1` and local schema **10**.
7. Spot-check Dungeon Board desktop/mobile disclosure placement and open/closed pointer state.
8. Resume/start a Dungeon and confirm current state, route effects, Cache, and results remain intact.

No DB migration, player reset, OAuth/environment change, new environment variable, protocol change, or gameplay/economy rebalance is required.
