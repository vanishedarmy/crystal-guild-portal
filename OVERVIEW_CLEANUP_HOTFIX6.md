# Crystal Guild v1.9.0 Alpha 6 — Overview Cleanup Hotfix 6

This frontend-only hotfix removes the redundant **Adventurer Home / Ready at a glance** quick-action panel from the player Overview.

## UI cleanup
- Removes the full-width `Ready at a glance` panel and its duplicated navigation shortcuts.
- The Overview now begins directly with Daily Reward and What's New, followed by Battle Profile, Progress, Equipment, Masteries, and Recent Activity.
- Main profile navigation remains the canonical way to reach Inventory, Jobs, Moogle Emporium, Blacksmith, Adventure Board, Stream Activities, Fellowship, and Chocobo Stable.
- No replacement spacer or empty wrapper is retained, so useful content moves upward naturally.

## Compatibility
- Frontend-only change.
- No gameplay, economy, progression, database, or protocol changes.
- Schema remains 19, hosted sync remains 1, and Portal Action protocol remains 36.
