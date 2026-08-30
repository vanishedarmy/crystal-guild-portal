# Upgrade Guide — Crystal Guild v1.4.0 — Dungeons & Delves Beta 2

Baseline: **v1.4.0 Dungeons & Delves Beta 1 Web + Beta 1 Bot**.

1. Leave the Bot, database, token storage, `.env`, and persistent state untouched.
2. Deploy the full **Beta 2 Web package**, or apply the **Beta 1 → Beta 2 Web patch** to the current Beta 1 Web root.
3. Restart/redeploy the hosted Web service only.
4. Verify `!cgversion` on the unchanged Bot still reports `1.4.0-dungeons-b1` with local schema **10**.
5. Verify `/api/health` reports hosted Web/frontend `1.4.0-dungeons-b2`, hosted sync schema **1**, and Portal Action protocol **25**.
6. Open the Dungeon Board and verify all four existing delves and their unlock/record state remain unchanged.
7. During an active delve, confirm the new run-status row, Carried Cache block, route-effect chips, and clear/retreat/defeat settlement guidance are readable.
8. On a narrow/mobile viewport, verify Dungeon cards stack cleanly, route choices use one column, and the four combat commands render as a two-column touch grid.
9. Confirm an older browser tab still fails closed after a newer Dungeon mutation, preserving the Beta 1 exact run/chamber/revision contract.

No Bot update, database migration, player reset, OAuth change, environment-variable change, protocol change, or gameplay rebalance is included.
