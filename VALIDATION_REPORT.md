# Validation Report — Crystal Guild v1.6.0 — Gold Saucer RC1 — Web

**PASS**

## Regression suites
- Matched RC1 Bot: **636 / 636 PASS**
- Frontend: **521 / 521 PASS**
- Hosted Web/API: **56 / 56 PASS**

## Source / asset gates
- Web Python parse: **12 / 12 PASS**
- Plain JS/MJS Node syntax: **190 / 190 PASS**
- CSS parse: **8 / 8 PASS**
- Public artwork: **0 PNG / 800 WebP**, **800 / 800 decode PASS**

## Focused RC1 checks
- Public release identity is `v1.6.0 RC1`; frontend/runtime revision is `1.6.0-gold-saucer-rc1`.
- All five planned Gold Saucer attractions remain represented in the finished floor.
- H5 full Triple Triad card faces and H6 compact opponent chooser remain intact.
- Mini Cactpot/Crystal Slots stay fixed-open; other current Saucer sections retain shared finger-pointer disclosures.
- Guide/What's New document the start-day UTC entry accounting hardening.

The source-only workspace has no installed project `node_modules`; `npm run build` reports `vite: not found`, so no local production-build claim is made.

Contract: runtime/frontend `1.6.0-gold-saucer-rc1`, schema **13**, hosted sync **1**, Portal protocol **29**, MGP canonical.
