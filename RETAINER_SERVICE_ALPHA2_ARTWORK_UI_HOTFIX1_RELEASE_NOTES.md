# Crystal Guild v1.7.0 — Retainer Service Alpha 2 Artwork & UI Hotfix 1

This Web-only hotfix packs the new Retainer Service artwork into the verified Alpha 2 interface. The Retainer desk now uses a dedicated pixel-art Retainer Office hero, rank-sensitive Moogle Retainer portraits and crests, illustrated assignment status states, five procurement-route scene cards, and route-specific material icon accents.

The gameplay contract is unchanged from Alpha 2: runtime `1.7.0-retainer-a2`, local database schema **15**, hosted sync **1**, Portal Action protocol **31**, one personal Retainer, one simultaneous assignment, dispatch-time reward commitment, exactly-once collection, and optional priority procurement. No prices, timers, reward rolls, EXP, rank thresholds, bonus odds, or material pools were changed.

Frontend asset revision advances to `1.7.0-retainer-a2h1`. The 28 shipping Retainer assets live under `/retainer/a2h1/` and are WebP. The public Web tree remains PNG-free.

Validation: frontend **535/535 PASS**; hosted Web/API **60/60 PASS**; Node JS/MJS syntax **194/194 PASS**; Web Python parse **14/14 PASS**; WebP decode **843/843 PASS**. The canonical Alpha 2 Bot remains unchanged. A Vite production-build pass is not claimed because packaged Web source does not include installed `node_modules`.
