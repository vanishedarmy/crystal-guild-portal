# Upgrade Guide — v1.4.0 Dungeons & Delves Alpha 2 Web Hotfix 1

Baseline: **v1.4.0 Dungeons & Delves Alpha 2 Web + Bot**.

1. Leave the Alpha 2 Bot and player database untouched; this is a Web-only hotfix.
2. Deploy the full Hotfix 1 Web package, or overlay the A2 → H1 Web patch onto the existing Alpha 2 Web root.
3. Redeploy/restart the hosted Web service.
4. Verify `/api/health` reports hosted Web runtime `1.4.0-dungeons-a2`, frontend revision `1.4.0-dungeons-a2-h1`, hosted sync schema **1**, and Portal Action protocol **24**.
5. Open **Adventure Board → Dungeon Board** and verify the crystal-dungeon scene is visible behind the board content.
6. Collapse the Dungeon Board and verify the compact shared pointer shows **right**; open it and verify it changes to **down**.
7. Spot-check Travel Regions, Hunt Board, Expedition Board/Atlas, and What's New to confirm their pointer sizing/state remains unchanged.

No Bot update, database migration, player reset, OAuth change, new environment variable, or gameplay rebalance is required.
