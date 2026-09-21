# Crystal Guild v1.9.0 Alpha 6 — Trading Post UI/UX Hotfix 2

This hotfix tightens **Moogle Emporium → Trading Post** item listings so more inventory fits on-screen while retaining readable controls and responsive behavior.

## Changes
- Browse Market and My Listings & Sell cards use a denser layout with reduced padding, smaller artwork, tighter metadata, and consolidated pricing information.
- Wide desktop Trading Post grids now show up to **3 cards per row**, stepping down to 2 columns on smaller desktop/tablet and 1 column on mobile.
- Mobile quantity/price controls remain touch-friendly even with the denser presentation.
- Browse descriptions are clamped to two lines so long item copy no longer creates uneven oversized cards.
- Listing fee and total-value copy is condensed into a single compact summary line.
- Trading Post item order is now deterministic and **type-first** across Browse Market, listable inventory, and the player's listing ledger.
- Type order is Weapons → Armor → Accessories → Supplies/Consumables → Materials → other item types.
- Equipment of the same type remains ordered by item level, highest first; same-type non-equipment falls back to alphabetical item name.

## Compatibility
- Runtime identity remains `1.9.0-world-events-alpha6`.
- Schema remains **19**.
- Hosted sync schema remains **1**.
- Portal Action protocol remains **36**.
- No player reset or migration is required.
- Listing fees, sale tax, listing duration, active-listing cap, eligibility, purchase safety, and transaction behavior are unchanged.
