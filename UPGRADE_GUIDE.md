# Upgrade Guide — Expeditions Beta 2 Hotfix 1

This is a **Web-only** hotfix for an existing Beta 2 deployment. Keep the existing Beta 1 Bot.

1. Back up the current Web deployment.
2. Apply the **B2 → B2H1 Web patch**, or deploy the full Beta 2 Hotfix 1 Web package.
3. Redeploy the hosted Web service.
4. Hard-refresh once if an older frontend bundle remains cached.
5. Open a detail card while scrolled well down a page and confirm it appears in the current viewport rather than at document top.
6. Confirm `/api/health` reports Web `1.2.0-expeditions-beta2` and frontend revision `1.2.0-expeditions-b2h1`.

No Bot update, database migration, OAuth change, environment-variable change, or player reset is required.
