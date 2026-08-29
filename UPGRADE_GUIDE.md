# Upgrade Guide — v1.3.1 UI Shared Assets Hotfix 4

Baseline: **v1.3.1 UI Hotfix 3 Web** with the unchanged `1.3.1-asset-optimization` Bot.

1. Leave Bot/database untouched.
2. Deploy the full UI4 Web package or overlay the UI3 → UI4 Web patch.
3. Redeploy/restart the hosted Web service.
4. Verify `/api/health` reports frontend revision `1.3.1-asset-optimization-ui4`.
5. Open Adventure Board and confirm Rally Venture visibly shows the generated party/dragon-castle scene behind the panel contents.
6. Open and close Travel Regions, Hunt Board, Expedition Board/Atlas, What's New, inventory groups, Fellowship, Streamer Dashboard, and Player Guide disclosures: **right hand closed, down hand open**.

No migration, reset, Bot update, OAuth/environment change, or gameplay rebalance is required.
