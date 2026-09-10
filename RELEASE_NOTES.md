# Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 5 — UI Revert & Button Fit

This correction **reverts the Unified PC/Mobile/SNES UI Pass in full** and restores the Web presentation to the verified **Gear Favorites Authority Fix** visual baseline.

The authoritative Favorites backend remains unchanged:
- player DB schema **16**
- Portal Action protocol **33**
- `player_gear_favorites` remains the canonical cross-device source of truth
- no player reset and no new database migration

## Retained UI correction — control fit only

No new visual theme is introduced. The only presentation changes beyond the restored baseline are layout-safety rules for controls:

- action rows wrap before buttons can leave their card or panel;
- long button labels may wrap instead of clipping;
- profile/navigation tabs return to the earlier wrap-safe behavior instead of the clipped one-line rail;
- compact tab/filter groups wrap cleanly at narrow widths;
- mobile action buttons retain practical 44px touch targets;
- very narrow phones allow primary action buttons to use the full card width when needed;
- icon/disclosure controls remain compact and are not stretched by the mobile rules;
- Player Guide controls receive the same fit-only treatment without changing its design.

The earlier Retainer mobile cleanup, Player Guide mobile top cleanup, Treasure Seekers Solo progress fix, Armor/Weapon Best Use presentation, Rally 100/0 and Solo 80/20 rules remain intact because they predate the reverted visual-system pass.
