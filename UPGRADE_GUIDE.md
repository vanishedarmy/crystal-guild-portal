# Upgrade Guide — v1.3.1 UI Shared Assets Hotfix 1

Baseline: **v1.3.1 Asset Optimization Web** with the compatible `1.3.1-asset-optimization` Bot.

1. Leave the Bot/database untouched; this is a Web-only update.
2. Deploy the full UI1 Web package, or overlay the UI1 Web patch onto the existing v1.3.1 Asset Optimization Web root.
3. Redeploy/restart the hosted Web service.
4. Verify `/api/health` reports hosted Web runtime `1.3.1-asset-optimization`, frontend revision `1.3.1-asset-optimization-ui1`, hosted sync schema **1**, and Portal Action protocol **22**.
5. Open Adventure Board and verify Rally Venture uses its new scene background.
6. Expand/collapse Travel Regions, Hunt Board, Expedition Board/Atlas, What's New, and Fellowship sections and confirm the pointer-hand state changes correctly.
7. Spot-check Streamer Dashboard and Player Guide disclosures on desktop and mobile.

No database migration, player reset, Bot update, OAuth change, new environment variable, or gameplay rebalance is required.
