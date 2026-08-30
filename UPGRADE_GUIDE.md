# Upgrade Guide — v1.4.0 Dungeons & Delves Alpha 3

Baseline: **Alpha 2 Bot + Alpha 2 Web Hotfix 1**.

1. Back up persistent data before deployment.
2. Apply the matching Alpha 2 → Alpha 3 Bot update.
3. Deploy the **Alpha 2 H1 → Alpha 3 Web patch** or full Alpha 3 Web package.
4. Restart/redeploy both services.
5. Verify `/api/health` reports Web/frontend `1.4.0-dungeons-a3`, hosted sync schema **1**, and Portal Action protocol **24**.
6. Verify `!cgversion` reports Bot runtime `1.4.0-dungeons-a3`, local schema **10**.
7. Open Dungeon Board and confirm all three delves render correctly, including the existing board background and normalized disclosure pointer.
8. Spot-check Crossroads effect previews, active route effects, first-clear presentation, and Player Guide coverage.

No database migration, player reset, OAuth change, or new environment variable is required from Alpha 2.
