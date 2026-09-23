# Crystal Guild v1.9.0 Alpha 8 — Seasonal Event Framework Validation

Validation target: runtime/frontend `1.9.0-seasonal-events-alpha8`, local schema **21**, hosted sync schema **1**, Portal Action protocol **37**.

## Halloween Individual Artwork Hotfix 3 (Web-only)
- All 31 replacements decode individually as WebP; 10 encounter/boss states, 5 currency/shop items, 8 trophy states, 4 headers and 4 separate environments. No source sprite sheet is bundled as a gameplay asset.
- New focused artwork/portal contract tests: **3/3 passing**; combined artwork and prior navigation tests: **5/5 passing**.
- Full frontend source/history suite: **707/762 passing**; exactly the same 55 inherited historical failures as Navigation Hotfix 2 (**704/759**), **zero new failure names**.
- Full hosted Web Python suite: **81/81 passing**. Bot code and DB schema are byte-identical to Hotfix 2.
- Final archive integrity, asset source references and package parity are verified before distribution.
- The production Vite bundle still requires installation of pinned dependencies on deployment.

## Automated results
- Bot full regression suite: **796 / 796 passed**.
- Focused Seasonal Event Framework suite: **4 / 4 passed**.
- Hosted Web/backend Python suite: **80 / 80 passed**.
- Frontend Node history suite: **699 / 754 passed**.
- Exact Alpha 7 package in this environment: **695 / 752 passed**, **57** inherited historical/legacy failures.
- Alpha 8 has **55** inherited frontend failures, introduces **zero new frontend failure names**, repairs two stale current-release identity assertions, and adds two passing seasonal tests.
- Python source compilation: **passed** for Bot and Web packages.

## Seasonal framework coverage
- Schema-21 migration installs reusable event-edition, player progress, daily objective, exact seasonal clear, reward claim, event trophy, and action-receipt persistence.
- Night of the Hollow Crystal installs **disabled by default**. Manual/scheduled activation and pause/resume controls are persisted.
- Four seasonal variants supplement eligible encounters at the configured controlled replacement rate; the base encounter engine remains authoritative.
- The Hollow Warden enters the existing World Event selection while the event is active without increasing the overall World Event scheduler rate.
- Seasonal monster rewards use a daily token cap; daily objective claims and Warden first-clear rewards are idempotent.
- Guild objectives only credit players who personally contributed a seasonal defeat that day.
- Moonlit Emporium ownership is persistent; non-repeatable rewards cannot be bought twice. The repeatable Spooky Supply Cache grants 3 Potions, 1 Ether, and 2 Antidotes per purchase.
- Four event trophies remain permanent and do not change the Hall of Trophies Phase-1 30/30 completion contract.

## Portal and artwork
- Adventurer Profile includes a dedicated Seasonal Event surface with event state, Moonlit Tokens, monster discovery, objectives, Moonlit Emporium, and event trophies.
- Streamer Control Center exposes seasonal enable/disable, pause/resume, manual/scheduled mode, and status controls.
- The approved FF/SNES-style Halloween art is packaged as cropped WebP assets under `/seasonal/halloween-2026/`, including locked monster and trophy versions.
- Responsive seasonal layouts collapse from a multi-column desktop gallery to a one-column narrow-mobile view without horizontal overflow.

## Compatibility
- Automatic verified migration: **schema 20 → 21** using `pre_schema_21_<timestamp>.db`.
- Hosted sync remains **1**.
- Portal Action protocol advances **36 → 37** for seasonal state/shop actions.
- No player reset, ordinary economy rebalance, combat balance change, Gold Saucer rebalance, or Hall Phase-1 reset.

## Frontend build environment
The source package does not include installed `node_modules`, so a production Vite bundle was not rebuilt in this isolated workspace. The Node source-contract/history suite ran directly against the packaged frontend source and seasonal assets. Normal deployment should install the pinned frontend dependencies before the production build.

## Package cleanup Hotfix 1 verification
- Exact runtime/source modules were left untouched. Only the current docs, historical asset manifests and associated packaging tests were updated.
- Removed 78 superseded documentation files and 69 obsolete artwork copies (two retired Triple Triad asset generations plus three redundant Hunt/Raid backgrounds).
- Focused frontend cleanup/visual checks: 14/14 passed.
- Bot full regression suite: **798/798 passed**.
- Hosted Web Python suite: **80/80 passed**.
- Frontend Node suite: **702/757 passed**; the same 55 inherited Alpha 8 historical assertions fail, with **zero new failure names**.
- Schema **21**, hosted sync **1**, Portal Action protocol **37** unchanged; no migration or player reset for already-deployed Alpha 8.
- The source package excludes installed frontend `node_modules`; the production Vite bundle must be built on deployment after installing pinned dependencies.

## Navigation & Seasonal Event Hotfix 2
- Reproduced the prior `/api/player/<username>/seasonal` 404 and verified the route now returns the synced event payload.
- Confirmed old snapshots without an event module return an explicit sync-pending state, both in memory and after cache eviction.
- Hosted Portal focused HTTP tests: **29/29 passed**.
- Full frontend Node source/history suite: **704/759 passed**, with the exact same **55 inherited historical assertions** as Package Cleanup Hotfix 1 (**702/757**); the two new regression tests pass and there are **zero new frontend failure names**.
- Bot package, gameplay, schema **21**, hosted sync **1**, and Portal Action protocol **37** remain unchanged. Frontend production Vite bundling still occurs on deployment using the pinned dependencies.
