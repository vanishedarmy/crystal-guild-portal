# Crystal Guild v1.6.0 — Gold Saucer Alpha 2 Canonical Baseline Audit

## Frozen scope
- Gold Saucer Alpha 2 gameplay remains unchanged.
- Monster Toss visual treatment remains fully integrated.
- The redundant top Monster Toss marquee is removed from rendering and from the public asset tree.
- The normal title row and Play Monster Toss start-state artwork remain.
- The active Monster Toss visual family contains 17 separate WebP assets under `/gold-saucer/a2h2/monster-toss/`.

## Frozen contract
- Bot/hosted runtime: `1.6.0-gold-saucer-a2`
- Frontend asset revision: `1.6.0-gold-saucer-a2h2`
- Local DB schema: **12**
- Hosted sync schema: **1**
- Portal Action protocol: **27**
- Twitch prefix: `!`

No migration, reset, OAuth/environment change, new variable, SP payout/rule change, or combat progression change.

## Validation
**615/615 Bot**, **484/484 frontend**, **51/51 hosted**, **116/116 Python parse**, **220/220 frontend parser**, **178/178 Node syntax**, **8/8 CSS parse**, **692/692 WebP decode**, **0 PNG**.

The local Vite production build was attempted but the source-only environment lacks the pinned Vite executable; that gate is recorded as unavailable rather than passed.
