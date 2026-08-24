# Crystal Guild v1.1.17 — Arsenal II Hotfix 2 Upgrade Guide

Upgrade baseline: **v1.1.17 — Arsenal II Hotfix 1**.

This is a **Web-only** update.

1. Leave the Bot deployment and live database unchanged.
2. Apply the Hotfix 2 Web patch over the current Hotfix 1 Web source, or replace the Web source with the full Hotfix 2 Web package.
3. Push the Web changes to GitHub and redeploy the hosted Web service.
4. Verify `/api/health` still reports runtime `1.1.17-arsenal-ii` and now reports frontend revision `1.1.17-arsenal-ii1h2`.
5. On a phone-width browser, open Heroes, Fellowship, Player Guide, Streamer Dashboard, and Privacy Policy. Confirm the top header consistently shows **roundel → LIVE/OFFLINE → hamburger**.
6. Open the hamburger and verify the page selector works. On Player Guide, confirm the separate Guide Sections control still opens the in-guide navigation.
7. Hard refresh once if an already-open tab still has the prior frontend bundle cached.

No database migration, player reset, Bot replacement, or OAuth reconfiguration is required.
