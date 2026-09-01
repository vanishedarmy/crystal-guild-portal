# Finalization Audit — Gold Saucer Alpha 5 Web Hotfix 4

## Scope
Web-only Triple Triad artwork recovery and Gold Saucer disclosure/UI consistency pass over the Alpha 5 H3 baseline.

## Root cause corrected
- H3 shipped the artwork files correctly, but `.triad-card-art` used `z-index: -2` inside an isolated card whose opaque background painted above it. H4 moves the artwork to `z-index: 0`, the shade to `z-index: 1`, and UI values/copy above both.
- H4 also republishes the 33-image family under a new cache-busted path and adds image fallbacks to cover stale/partial asset deployments.

## UI continuity
- Gold Saucer collapsible sections now use the shared right/down finger-pointer image language used elsewhere in the Portal.
- Mini Cactpot and Crystal Slots remain permanently open.
- H1/H2 render recovery and quantity-input behavior remain present.
- Mobile Triple Triad context artwork is no longer intentionally hidden.

## Safety and continuity
- No database migration or player-data reset.
- No MGP balance, entry-cost, payout, daily-limit, card-stat, opponent, or Triple Triad rule changes.
- No Portal action additions; protocol remains 29.
- H4 artwork files are byte-identical copies of the validated H3 visual files; only the public path changes.

## Package hygiene
- Runtime `.env`, databases, SQLite files, test state, Python bytecode, `__pycache__`, `node_modules`, and build output are excluded from deliverables.
- `.env.example` remains included where present.
- Public frontend assets remain PNG-free.

## Validation
Bot **631/631**, frontend **514/514**, hosted Web/API **56/56**, TS parser **229/229**, Node syntax **187/187**, Python parse **12/12**, CSS parse **8/8**, WebP decode **767/767**.
