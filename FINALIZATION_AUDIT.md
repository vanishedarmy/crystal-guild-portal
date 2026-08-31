# Crystal Guild v1.6.0 — Gold Saucer Alpha 2 Web Hotfix 1 Release Audit

## Frozen scope
- Web-only Monster Toss visual treatment.
- 18 separate WebP assets, not a combined sprite sheet.
- Explicit scenic DOM layer plus target/style/result/status UI integration.
- Existing Gold Saucer Alpha 1 visual family and all Alpha 2 gameplay retained unchanged.

## Frozen contract
- Hosted runtime: `1.6.0-gold-saucer-a2`
- Frontend asset revision: `1.6.0-gold-saucer-a2h1`
- Compatible Bot: `1.6.0-gold-saucer-a2`
- Local DB schema: **12**
- Hosted sync: **1**
- Portal Action protocol: **27**
- Twitch prefix: `!`

No Bot update, migration, reset, OAuth/environment change, required variable, SP/Gil balance change, Monster Toss odds/payout change, or combat progression change.

## Validation
- **484/484 frontend PASS**.
- **51/51 hosted Web/API PASS**.
- **10/10 Web Python compile**, **220/220 frontend parser**, **178/178 Node syntax**, **8/8 CSS parse**.
- Public assets: **0 PNG / 693 WebP**, all decode successfully.
- New Monster Toss art: **18/18 WebP**; 17 transparent UI/sprite assets retain alpha and the scenic background is intentionally opaque.
- Production Vite build attempted but unavailable because the local Vite executable is not installed in this source-only environment.

## Packaging
Baseline clean Web tree: **951 files**. Final H1 clean Web tree: **972 files**. Alpha 2 → H1 delta: **53 changed/new files, 0 deletions**. The patch is applied to a copied Alpha 2 baseline and must reproduce all 972 final files byte-for-byte before release. Full Web, patch, and visual-assets archives are CRC-tested; runtime/private artifacts are excluded from the shipping tree.
