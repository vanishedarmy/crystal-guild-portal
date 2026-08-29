# Upgrade Guide — v1.3.1 UI Shared Assets Hotfix 2

Baseline: **v1.3.1 UI Hotfix 1 Web** with the compatible `1.3.1-asset-optimization` Bot.

1. Leave the Bot and database untouched; this is a Web-only update.
2. Deploy the full UI2 Web package, or overlay the UI1 → UI2 Web patch onto the existing UI1 Web root.
3. Redeploy/restart the hosted Web service.
4. Verify `/api/health` reports hosted Web runtime `1.3.1-asset-optimization`, frontend revision `1.3.1-asset-optimization-ui2`, hosted sync schema **1**, and Portal Action protocol **22**.
5. Open Adventure Board and confirm the Rally Venture scene is visibly rendered behind the panel content.
6. Expand/collapse Travel Regions, Hunt Board, Expedition Board/Atlas, What's New, Fellowship, Player Guide, and Streamer Dashboard sections. Confirm the same hand graphic remains visible in both states and no small `Expand`/`Collapse` label is shown.

No database migration, player reset, Bot update, OAuth change, new environment variable, gameplay change, or rebalance is required.
