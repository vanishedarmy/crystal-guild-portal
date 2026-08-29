# Crystal Guild v1.2.0 — Expeditions Beta 2
## UX Consolidation

Beta 2 keeps the v1.2 gameplay feature set frozen and consolidates the Portal around clearer decisions, stable expansion behavior, and less repeated information.

## Viewport-preserving openable cards
- Opening a Portal detail card now captures the current document viewport before the native dialog opens.
- Closing the detail restores the same background position and returns focus to the originating card with `preventScroll`.
- Major collapsible Portal sections use the same anchored behavior: What's New, Distant Expedition Board, Expedition Atlas, Travel Regions, Hunt Board, and the Chocobo portrait gallery.
- Player Guide Bestiary/Items catalog launch panels no longer call `scrollIntoView()` when opened or closed; they preserve the reader's current page position.
- Intentional navigation (tabs, explicit Guide anchor links, skip links) continues to move to its destination normally.

## Adventure Board hierarchy
- Adds a compact status summary for Current Activity, Solo Venture, Expedition, and Hunts.
- Saved results and active activities receive priority above routine choices.
- The normal decision order is Solo Venture → Rally Venture → Camp → Expeditions → Travel Regions → Hunt Board.
- Active Solo/Expedition/Hunt/Camp/Rally content rises above the routine order while it is in progress.
- Travel-region descriptions are visually constrained to keep action controls easier to scan.

## Expedition progression cleanup
- The Expedition Atlas keeps rank and overall progress visible while secondary statistics can be independently collapsed.
- Atlas open/closed state is remembered in the browser and defaults compact on narrow layouts.
- Camp/recovery copy is shortened without changing timers or recovery rules.

## Compatibility
- Product: **v1.2.0 — Expeditions Beta 2**
- Hosted Web runtime: `1.2.0-expeditions-beta2`
- Frontend asset revision: `1.2.0-expeditions-b2`
- Compatible Bot runtime: `1.2.0-expeditions-b1` (unchanged)
- Local DB schema: **8** (unchanged)
- Hosted sync schema: **1** (unchanged)
- Portal Action protocol: **20** (unchanged)
- Player reset / database migration: **none**
- New environment variables: **none**
