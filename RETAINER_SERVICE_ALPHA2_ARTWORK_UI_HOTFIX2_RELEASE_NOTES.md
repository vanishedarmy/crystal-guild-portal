# Crystal Guild v1.7.0 — Retainer Service Alpha 2 Artwork & UI Hotfix 2

This Web-only corrective hotfix fixes the Retainer profile layout shown after Artwork & UI Hotfix 1. The Retainer page now explicitly restores its intended 12-column CSS grid, so the `span-4` profile panel and `span-8` current-assignment panel render side-by-side on desktop instead of the profile panel expanding to the full page width.

The Moogle portrait is also hard-bounded with desktop, tablet, and mobile maximum dimensions. This prevents intrinsic artwork size or viewport scaling from allowing the portrait to dominate or overflow the Retainer profile card. The rank crest is reduced proportionally. Existing Retainer Office, status, assignment, and material artwork is unchanged and remains under `/retainer/a2h1/`.

Gameplay is unchanged: runtime `1.7.0-retainer-a2`, local database schema **15**, hosted sync **1**, Portal Action protocol **31**, Retainer prices/timers/rewards/EXP/ranks, targeted procurement, persistence, and exactly-once collection all remain unchanged. Only the Web frontend asset revision advances to `1.7.0-retainer-a2h2`.
