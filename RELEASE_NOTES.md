# Crystal Guild v1.2.0 — Expeditions Beta 2 Hotfix 1

## Current-viewport detail cards
- Fixes detail/openable cards appearing at the top of document layout even though the background page no longer scrolled.
- Detail dialogs now use fixed viewport positioning rather than inheriting the retro window layer's relative positioning.
- Desktop dialogs open centered in the player's current visible viewport.
- Narrow/mobile dialogs open as a bottom sheet inside the current viewport.
- Closing still restores focus to the originating card with `preventScroll`, and the page remains at the original scroll position.
- Beta 2 action-first Adventure Board, anchored collapsibles, Atlas collapse preference, and Player Guide catalog behavior are unchanged.

## Compatibility
- Public product: **v1.2.0 — Expeditions Beta 2**
- Hosted Web runtime: `1.2.0-expeditions-beta2`
- Frontend asset revision: `1.2.0-expeditions-b2h1`
- Compatible Bot runtime: `1.2.0-expeditions-b1`
- Local DB schema: **8**
- Hosted sync schema: **1**
- Portal Action protocol: **20**
- Player reset/migration: **none**
