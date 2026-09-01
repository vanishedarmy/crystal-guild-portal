# Crystal Guild v1.7.0 — Retainer Service Alpha 2 Artwork & UI Hotfix 2

This Web-only corrective hotfix fixes the Retainer profile layout shown after Artwork & UI Hotfix 1. The Retainer page now explicitly restores its intended 12-column CSS grid, so the `span-4` profile panel and `span-8` current-assignment panel render side-by-side on desktop instead of the profile panel expanding to the full page width.

The Moogle portrait is also hard-bounded with desktop, tablet, and mobile maximum dimensions. This prevents intrinsic artwork size or viewport scaling from allowing the portrait to dominate or overflow the Retainer profile card. The rank crest is reduced proportionally. Existing Retainer Office, status, assignment, and material artwork is unchanged and remains under `/retainer/a2h1/`.

Gameplay is unchanged: runtime `1.7.0-retainer-a2`, local database schema **15**, hosted sync **1**, Portal Action protocol **31**, Retainer prices/timers/rewards/EXP/ranks, targeted procurement, persistence, and exactly-once collection all remain unchanged. Only the Web frontend asset revision advances to `1.7.0-retainer-a2h2`.

---

# Crystal Guild v1.7.0 — Retainer Service Alpha 2 Artwork & UI Hotfix 1

This Web-only hotfix packs the new Retainer Service artwork into the verified Alpha 2 interface. The Retainer desk now uses a dedicated pixel-art Retainer Office hero, rank-sensitive Moogle Retainer portraits and crests, illustrated assignment status states, five procurement-route scene cards, and route-specific material icon accents.

The gameplay contract is unchanged from Alpha 2: runtime `1.7.0-retainer-a2`, local database schema **15**, hosted sync **1**, Portal Action protocol **31**, one personal Retainer, one simultaneous assignment, dispatch-time reward commitment, exactly-once collection, and optional priority procurement. No prices, timers, reward rolls, EXP, rank thresholds, bonus odds, or material pools were changed.

Frontend asset revision advances to `1.7.0-retainer-a2h1`. The 28 shipping Retainer assets live under `/retainer/a2h1/` and are WebP. The public Web tree remains PNG-free.

Validation: frontend **535/535 PASS**; hosted Web/API **60/60 PASS**; Node JS/MJS syntax **194/194 PASS**; Web Python parse **14/14 PASS**; WebP decode **843/843 PASS**. The canonical Alpha 2 Bot remains unchanged. A Vite production-build pass is not claimed because packaged Web source does not include installed `node_modules`.

---

# Crystal Guild v1.7.0 — Retainer Service Alpha 2

Alpha 2 expands the personal Retainer Service with **targeted procurement** and a persistent recent-haul record. Every existing assignment can still run as the Alpha 1 general mixed haul, or the player can nominate one material from that route as a priority.

A focused dispatch costs a modest Gil premium and guarantees one normal reward roll for the selected material. Remaining rolls and bonus finds stay mixed and independent, preventing priority procurement from becoming a rare-material multiplier. General assignment costs, durations, Retainer EXP, Rank thresholds, one-assignment limits, dispatch-time reward commitment, and exactly-once collection are unchanged.

The Retainer desk now records the eight most recently collected assignments with route, priority, haul, bonus find, Gil cost, and Retainer EXP.

Database schema advances from **14 to 15** for Retainer history. Portal Action protocol advances from **30 to 31** because `RETAINER_DISPATCH` now accepts an optional `priority` material ID. Hosted sync remains 1. No artwork changes are included in Alpha 2; Retainer artwork is intentionally the next pass.

Runtime identity: `1.7.0-retainer-a2`.
