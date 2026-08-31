# Upgrade Guide — v1.6.0 Gold Saucer Alpha 2 Web Hotfix 1

Supported baseline: **v1.6.0 Gold Saucer Alpha 2 Web + Alpha 2 Bot**.

1. Leave the Alpha 2 Bot and live database unchanged.
2. Preserve hosted secrets, `.env`, persistent state, and token storage.
3. Deploy the full Hotfix 1 Web package or apply the Alpha 2 → Alpha 2 H1 Web patch.
4. Restart/redeploy only the hosted Web service.
5. Verify `/api/health` reports hosted runtime `1.6.0-gold-saucer-a2`, frontend asset revision `1.6.0-gold-saucer-a2h1`, hosted sync 1, and Portal protocol 27.
6. Open Gold Saucer → Monster Toss and confirm the scenic background, four target images, three throw-style banners, targeting reticle, score/throws art, and hit/miss/final-result art are visible.
7. Confirm Mini Cactpot, Crystal Slots, Prize Counter, and Monster Toss rules/payouts behave exactly as before.

No database migration or player reset is required. Schema remains 12.
