# Upgrade Guide — Crystal Guild v1.2.0 Expeditions Beta 2

Beta 2 is a **Web-only** UX release. The existing Expeditions Beta 1 Bot remains compatible.

## From Beta 1
1. Back up the current Web deployment as normal.
2. Apply the **B1 → B2 Web patch** over the existing Beta 1 Web tree, or deploy the full Beta 2 Web package.
3. Keep the existing Bot runtime `1.2.0-expeditions-b1` and existing `.env`, database, and token storage unchanged.
4. Redeploy the hosted Web service.
5. Refresh the browser once if an older frontend revision remains cached.
6. Confirm `/api/health` reports Web `1.2.0-expeditions-beta2`, frontend revision `1.2.0-expeditions-b2`, hosted sync schema 1, and Portal Action protocol 20.
7. Open a detail card midway down a Portal page and confirm the background remains at the same scroll position when the card opens/closes.
8. On Adventure Board, confirm current activity/results appear before routine actions and the Expedition Atlas can collapse independently.

No Bot deployment, database migration, player reset, OAuth change, or environment-variable change is required.
