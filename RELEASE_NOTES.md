# Crystal Guild v1.2.0 — Expeditions Beta 3
## Mobile & Accessibility Polish

Beta 3 keeps the v1.2 feature set frozen and hardens the Portal for phone, touch, keyboard, contrast, and reduced-motion use.

### Mobile polish
- Practical 44px touch targets are enforced for primary controls on coarse-pointer devices.
- Safe-area insets are respected by the compact header, mobile menu, detail dialogs, Guide navigation, and footers.
- Mobile form fields use 16px text to avoid browser zoom while remaining readable.
- Detail dialogs fit the visible dynamic viewport and remain internally scrollable.
- Narrow layouts collapse commerce, crafting, Expedition summaries, result grids, and long labels before they overflow.
- Dedicated 390px-and-below rules cover small phones; phone landscape continues using the compact mobile header.

### Accessibility polish
- Profile, Moogle Emporium, and Blacksmith tablists use a roving keyboard focus model with Arrow keys plus Home/End.
- Active tab panels are explicitly labelled and keyboard focus is visible.
- Detail dialogs expose an accessible content label and Escape uses the same close/viewport-restore path as the close button.
- Closing the mobile site menu with Escape restores focus to the menu toggle without scrolling.
- Increased-contrast, forced-colors, and reduced-motion preferences receive explicit Portal, Player Guide, and Streamer support.
- Active tabs use a visible underline in addition to color/border state.

### Preserved Beta behavior
- Beta 2 Hotfix 1 current-viewport dialog positioning remains intact.
- Beta 2 Hotfix 2 portrait scenic backgrounds and duplicate-airship cleanup remain intact.
- Beta 1 route pressure, Legendary tuning, Alpha 5 Chocobo specialization/stipends, Expeditions, Hunts, and progression are mechanically unchanged.

## Compatibility
- Hosted Web runtime: `1.2.0-expeditions-beta3`
- Frontend asset revision: `1.2.0-expeditions-b3`
- Compatible Bot runtime: `1.2.0-expeditions-b1`
- Local DB schema: **8**
- Hosted sync schema: **1**
- Portal Action protocol: **20**
- Migration/player reset: **none**
- New environment variables/OAuth scopes: **none**
