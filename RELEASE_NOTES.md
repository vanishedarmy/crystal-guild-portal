# Crystal Guild v1.7.0 — Moogle Emporium Annex Alpha 3

Alpha 3 adds the **Moogle Emporium Annex**, a small one-time Fellowship construction project that permanently expands the personal Emporium for the whole Guild.

The Annex unlocks at **Fellowship LVL 3** and requires **20,000 Gil**, **12 Mythril Ore**, and **20 crafted items** alongside the level requirement. When construction completes, every recruited adventurer's personalized Moogle Emporium rotation expands from **9 to 12 stock slots**.

The original nine-slot shop composition remains the foundation of each rotation; the Annex adds three further weighted picks from the same level/job-eligible merchandise pool without duplicates. Prices, sell values, refresh timing, item definitions, and purchase rules do not change. Because there are three additional picks, players have more choice per rotation, which is the intended Annex benefit, but nothing is granted for free.

Existing nine-slot cached shop rotations detect the new Guild capacity and rebuild automatically after Annex completion, so the benefit is visible immediately on the next shop request rather than waiting for the prior rotation timer.

The Fellowship public Guild Board now displays the Annex as a sixth facility card while the existing five-major-facility Legacy accomplishments remain unchanged. The Portal's Fellowship Services and Moogle Emporium panels both show Annex status and current stock capacity.

Runtime advances to `1.7.0-emporium-annex-a3`. Local database schema remains **15**, hosted sync remains **1**, Portal Action protocol remains **31**, and the Twitch command prefix remains `!`. Retainer Service Alpha 2, Gold Saucer v1.6.0, and all existing progression carry forward unchanged.

---

# Crystal Guild v1.7.0 — Retainer Service Alpha 2 Mobile Visual Pass Hotfix 3

This Web-only hotfix is a deliberately tight responsive UI pass. It fixes the Gold Saucer hero shown collapsing at intermediate/mobile-landscape widths. The cause was the hero's second CSS grid track using `auto`: the long MGP explanatory note contributed a very large max-content width, allowing the Current Balance card to consume nearly the whole row and crush the Gold Saucer title/intro copy into a narrow strip.

The hero now uses a bounded 220–360px balance track while the copy column remains `minmax(0,1fr)`. The balance card itself is width-bounded and its note wraps locally. At the existing <=900px breakpoint the hero explicitly becomes one column and the balance card stretches to the available width. A small <=620px spacing/type adjustment keeps the phone presentation compact.

The selective pass also checked the nearby Gold Saucer disclosure pointer alignment, Chocobo Racing responsive cards, Triple Triad opponent layouts, and the Retainer Hotfix 2 grid/portrait rules. Those existing responsive treatments remain intact; no broad redesign or gameplay change was introduced.

Runtime remains `1.7.0-retainer-a2`, local database schema **15**, hosted sync **1**, and Portal Action protocol **31**. Frontend asset revision advances to `1.7.0-retainer-a2h3`.

---

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
