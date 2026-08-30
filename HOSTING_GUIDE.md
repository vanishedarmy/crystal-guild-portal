# Crystal Guild Hosted Web — Trails & Raids Alpha 1 Hotfix 2

This is a **Web-only frontend/guide** hotfix. Keep the existing v1.5.0 Alpha 1 Bot.

Hosted runtime: `1.5.0-trails-raids-a1h1`  
Frontend revision: `1.5.0-trails-raids-a1h2`  
Compatible Bot: `1.5.0-trails-raids-a1`  
Hosted sync schema: **1**  
Portal Action protocol: **25**

## Deploy
1. Deploy the full Hotfix 2 Web package or apply the Hotfix 1 → Hotfix 2 Web patch.
2. Restart/redeploy the hosted Web service.
3. Leave the Bot and live database untouched.
4. Verify `/api/health` reports Web runtime `1.5.0-trails-raids-a1h1`, frontend revision `1.5.0-trails-raids-a1h2`, sync schema 1, and Portal protocol 25.
5. Confirm the Player Guide includes a dedicated Riftglass Observatory card and the old gold divider is absent across the site.
6. Confirm Portal sync remains healthy; the Hotfix 1 Overlay allowlist repair remains present.

No new environment variables are introduced. Preserve the existing hosted sync key, OAuth configuration, and persistent hosted data.
