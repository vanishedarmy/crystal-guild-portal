# Validation Report — Crystal Guild v1.6.0 — Gold Saucer Alpha 5 Web Hotfix 6 — Triple Triad Opponent UI Pass

**PASS**

## Regression suites
- Matched H5 Bot: **632 / 632 PASS**
- Frontend: **519 / 519 PASS**
- Hosted Web/API: **56 / 56 PASS**

## Source / asset gates
- Web Python parse: **12 / 12 PASS**
- Plain JS/MJS Node syntax: **189 / 189 PASS**
- CSS parse: **8 / 8 PASS**
- Public artwork: **0 PNG / 800 WebP**, **800 / 800 decode PASS**

## Focused H6 checks
- `triad-opponents-banner` is absent from the live Triple Triad component.
- `ui/opponents.webp` is no longer referenced by the live component as a header or fallback.
- Opponent cards retain the three dedicated opponent portraits.
- Selected opponent state renders an explicit `SELECTED` label.
- Desktop and mobile opponent layouts have dedicated compact rules.
- H5 full-card faces and Gold Saucer finger-pointer disclosures are preserved.

The source-only workspace does not include installed project `node_modules`, so no local Vite production-build claim is made.

Contract: runtime/Bot `1.6.0-gold-saucer-a5h5`, frontend `1.6.0-gold-saucer-a5h6`, schema **13**, hosted sync **1**, Portal protocol **29**, MGP canonical.
