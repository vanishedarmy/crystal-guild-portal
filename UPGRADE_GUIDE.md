# Upgrade Guide — Guild Expansion Alpha 5 Hotfix 1

Baseline: **v1.3.0 Guild Expansion Alpha 5**.

This is a **Web-only** update.

1. Leave the Alpha 5 Bot and live player database unchanged.
2. Deploy `CrystalGuild-v1.3.0-Guild-Expansion-Alpha5-Hotfix1-Web.zip`, or overlay the direct Alpha 5 → Alpha 5 Hotfix 1 Web patch.
3. Redeploy the hosted Web service.
4. Verify `/api/health` reports hosted runtime `1.3.0-guild-expansion-a5`, frontend revision `1.3.0-guild-expansion-a5h1`, hosted sync schema **1**, and Portal Action protocol **21**.
5. Hard-refresh the Portal once so the cache-busted Hotfix 1 frontend and Founding Hall image load.
6. Open **Fellowship → Guild Legacy** while the Guild is at Founding Hall and confirm the portrait Hall scene fills the Legacy panel without reducing readability.
7. Open **Equipment & Inventory** and confirm Weapons, Armor, Accessories, Consumables, and Materials expand/collapse independently and remain in the chosen state after reload.

No database migration or player reset is required.
