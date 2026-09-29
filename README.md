# Crystal Guild — Web (v1.9.0 Alpha 13: Trading Post QoL)

The hosted Player Portal, Streamer Control Center, React/Vite frontend and the full public asset tree. **Deploy alongside the matching Alpha 13 Bot** with Portal Action protocol **39**; the hosted sync schema remains **1**.

The Moogle Trading Post now includes Browse, Watchlist, Recently Sold and My Listings & Sell views. Users can save up to 30 eligible items, see their currently owned quantities, inspect actual 30-day completed-sale history and quantity-weighted averages, use clearly qualified asking-price comparisons, and relist at the previous price/quantity only if inventory and fees allow. All market writes still pass through the authoritative Bot. See root `RELEASE_NOTES.md`.

**Build:** This package contains source and all 954 existing public assets in `frontend/public/`, but deliberately excludes a stale built `frontend/dist/`. In `frontend/`, run `npm ci` then `npm run build` on a machine with npm registry access before deployment. Preserve live hosted data, environment variables, authentication secrets and configuration. Follow root `START_HERE.md` and this folder's `UPGRADE_GUIDE.md`; prior release notes and feature documents remain as historical references.

**Validation:** The Alpha 13 Trading Post tests, full hosted Web suite and focused frontend tests pass. A production Vite build, deployed browser walkthrough and the known legacy historical-test failures remain outstanding; see root `TRADING_POST_ALPHA13_VALIDATION.md` for exact counts.
