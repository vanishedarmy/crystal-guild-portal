# Validation Report — Gold Saucer Alpha 2 Web Hotfix 1

## Result
**PASS** for all executable source, Web/API, and asset gates available in the source-only environment.

## Automated suites
- Frontend Node regression suite: **484 / 484 PASS**.
- Hosted Web/API suite: **51 / 51 PASS**.
- Matching Alpha 2 Bot is unchanged by this Web-only hotfix.

## Source validation
- Web Python compile sweep: **10 / 10 PASS**.
- Frontend JS/JSX/MJS TypeScript-parser sweep: **220 / 220 PASS**.
- Plain JS/MJS Node syntax: **178 / 178 PASS**.
- CSS parse: **8 / 8 PASS**.

## Artwork validation
- New Monster Toss artwork: **18 / 18 WebP decode PASS**.
- New transparent UI/sprite artwork: **17 / 17 retain alpha**; the scenic background is intentionally opaque.
- Final public artwork tree: **0 PNG / 693 WebP**, **693 / 693 decode PASS**.
- New asset family is cache-busted at `/gold-saucer/a2h1/monster-toss/`.
- Manifest covers all 18 separate assets and their SHA-256 hashes.

## Functional visual coverage
- Explicit Monster Toss scenic DOM image layer: PASS.
- Small / Medium / Large / Golden Cactuar target mapping: PASS.
- Safe / Normal / Power throw-style mapping: PASS.
- Selected-target reticle: PASS.
- Score / throws-left frames: PASS.
- Projectile presentation: PASS.
- Hit / miss throw feedback: PASS.
- Bullseye / jackpot completed-game presentation: PASS.
- Mobile responsive rules and reduced-motion handling: PASS.

## Production frontend build gate
`npm run build` was attempted. The source-only environment does not contain the pinned local Vite executable (`vite: not found`, exit 127), so this report does not claim a local Vite production-build pass. Regression, parser, syntax, CSS, asset decode, and package reconstruction gates are reported separately.

## Compatibility
Hosted runtime `1.6.0-gold-saucer-a2`; frontend asset revision `1.6.0-gold-saucer-a2h1`; schema **12**; hosted sync **1**; Portal Action protocol **27**; prefix `!`. No gameplay/economy/backend change. Clean-tree packaging target: **972 Web files**, with **53 changed/new and 0 deleted** relative to Alpha 2.
