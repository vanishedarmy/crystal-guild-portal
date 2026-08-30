# Crystal Guild Hosted Web — Trails & Raids Alpha 1 Hotfix 1

This is a **Web-only** hotfix. Keep the existing v1.5.0 Alpha 1 Bot running.

Hosted runtime: `1.5.0-trails-raids-a1h1`  
Frontend revision: `1.5.0-trails-raids-a1`  
Compatible Bot: `1.5.0-trails-raids-a1`  
Hosted sync schema: **1**  
Portal Action protocol: **25**

## Deploy
1. Deploy the full Hotfix 1 Web package or apply the Alpha 1 → Hotfix 1 Web patch.
2. Restart/redeploy the hosted Web service.
3. Leave the Bot and live database untouched.
4. Verify `/api/health` reports Web runtime `1.5.0-trails-raids-a1h1`, frontend revision `1.5.0-trails-raids-a1`, sync schema 1, and Portal protocol 25.
5. Confirm Portal sync no longer logs HTTP 400 for `last_mechanic` (or other Alpha 1 Raid Overlay fields).

No new environment variables are introduced. Preserve the existing hosted sync key, OAuth configuration, and persistent hosted data.
