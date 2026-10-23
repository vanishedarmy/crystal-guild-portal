# Crystal Guild v1.9.4.7 — Overview Tab Readability Rework

This patch reworks the player **Overview** tab around a summary-first information hierarchy. It is a frontend-only presentation update built on top of the current v1.9.4.7 Web baseline, including the Retainer Service redesign.

## What changed

- Consolidated the separate **Battle Profile**, **Progress**, and **Masteries** panels into one structured **Character Overview** panel.
- Battle information now reads in two levels:
  - featured **ATK / M.PWR** totals;
  - compact STR, VIT, MAG, SPR, DEX, and LCK values.
- Progress is now shown as a short vertical journey list with progress bars for Bestiary, Achievements, and Jobs Mastered, plus Boss Clears.
- Fellowship standing and equipped Masteries now share one clearly grouped Guild Setup block.
- Added direct **Achievements** and **Jobs** navigation links from the summary instead of duplicating those full systems on the Overview.
- Reworked **Current Loadout** into smaller, more readable equipment cards and added a **Manage Equipment** shortcut to Equipment & Inventory.
- **Recent Activity** now starts collapsed and uses a compact two-column ledger when expanded on desktop.
- **What's New** now defaults collapsed for first-time visitors. Existing explicit open/closed preference is still respected.
- Daily Guild Provisions were visually condensed so the reward remains easy to claim without dominating the first screen.
- Added responsive layouts for desktop, tablet, and mobile. Mobile falls back to one clear vertical information flow.

## Gameplay / data impact

None. No Bot, database, Portal Action protocol, progression, economy, balance, or snapshot schema changes are included.

## Files changed

- `frontend/src/player/Overview.jsx`
- `frontend/src/player/WhatsNew.jsx`
- `frontend/src/styles/portal.css`
- `frontend/tests/overviewReadability1947.test.mjs`

## Validation

- Overview-specific regression tests: **6/6 passing**.
- JSX syntax for `Overview.jsx` and `WhatsNew.jsx` was parsed/transpiled successfully with the available TypeScript compiler.
- `npm ci --offline` cannot install Vite because the Vite package is not present in the local npm cache, so a fresh Vite production bundle could not be generated in this workspace.
- The repository's complete historical frontend test set is not a clean global gate at this baseline: it contains unrelated legacy assertions from prior feature revisions. The Overview-specific tests introduced/affected by this patch pass.

## Deployment

The MERGE archive contains only the source/test/readme changes and can be merged into the current v1.9.4.7 source tree.

The FULL DEPLOY ROOT archive contains the complete current Web tree with this patch and the preceding Retainer Service redesign. The frontend should be rebuilt through the normal Vite/Docker deployment workflow.
