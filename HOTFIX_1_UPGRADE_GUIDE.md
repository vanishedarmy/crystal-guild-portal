# Crystal Guild v1.1.17 — Arsenal II Hotfix 1 Upgrade Guide

Upgrade baseline: **v1.1.17 — Arsenal II**.

1. Leave the Bot deployment unchanged.
2. Apply the Web patch over the current v1.1.17 Arsenal II source, or replace the Web source with the Hotfix 1 Web package.
3. Push the Web changes to GitHub and redeploy the hosted Web service.
4. Verify `/api/health` still reports runtime `1.1.17-arsenal-ii` and now reports frontend revision `1.1.17-arsenal-ii1h1`.
5. Open `/guide` and confirm the masthead badge reads **v1.1.17 / Arsenal II**.
6. Hard refresh once if an already-open browser tab is still holding the previous bundle.

No database migration, player reset, Bot replacement, or OAuth reconfiguration is required.
