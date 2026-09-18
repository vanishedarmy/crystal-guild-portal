# Crystal Guild v1.8.1 — Mobile Context Help Hotfix 2

This Web-only hotfix keeps contextual quick-help controls (`?`) anchored to the upper-right corner of mobile panel headers instead of allowing them to wrap into content or metadata rows.

## Mobile UI fixes

- Standard panel headers now reserve a compact upper-right utility slot for contextual help.
- Wallets, status badges, counts, and other header metadata wrap independently below the title instead of moving the help control.
- Adventure Board, Camp & Recovery, Solo Venture, Stream Venture, Inventory, Jobs, Relics, Retainer Service, Blacksmith, Moogle Emporium, and other shared `panel-title-row` surfaces inherit the corrected behavior.
- Chocobo Stable receives the same upper-right help anchoring despite using its own header-status wrapper.
- Collapsible boards keep contextual help immediately beside the collapse/expand pointer in the upper-right corner.
- Dungeon, Expedition, Travel Region, Hunt, and Trial/Raid disclosure controls retain compact 34px mobile utility sizing.
- Title content reserves enough right-side space to avoid text or control overlap.

## Compatibility

- Runtime remains `1.8.1-merc-recruitment`.
- Local database schema remains **18**.
- Hosted sync schema remains **1**.
- Portal Action protocol remains **35**.
- No gameplay, economy, save-data, migration, or Bot behavior changes.
- Includes the prior Dungeon monster portrait Hotfix 1.

## Validation

- Frontend Node regression suite: **676/676 PASS**.
- Hosted Web/API Python suite: **78/78 PASS**.
- New mobile quick-help corner regression coverage: **4/4 PASS** as part of the frontend suite.
- Bot source is unchanged from the Hotfix 1 baseline.
