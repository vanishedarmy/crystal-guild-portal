# Crystal Guild v1.8.2 — Comprehensive UI/UX Polish

This pass keeps the visible release title and runtime identity unchanged while tightening the Portal and Player Guide across desktop, tablet, and mobile.

## Readability and wrapping

- Adds a final containment layer so long names, descriptions, badges, controls, and data cannot widen cards or the Portal viewport.
- Uses balanced heading wrapping and natural paragraph wrapping while avoiding destructive mid-word breaks in normal interface copy.
- Tightens panel spacing, title spacing, status strips, action groups, and dense service cards without reducing core readability.
- Mobile form controls use 16px text to improve readability and prevent browser auto-zoom behavior.
- Mobile player names, status badges, Merc objective values, and action labels now favor readable wrapping over desktop ellipsis/nowrap truncation.

## Actions and interaction

- Strengthens visual hierarchy for primary, secondary, ghost, and danger actions.
- Keeps core combat actions compact and balanced while allowing longer ability/item choices to stack when narrow screens need more room.
- Preserves the requested two-column mobile recovery-item layout, with a safe one-column fallback only on extremely narrow screens.
- Tightens Stream Venture/Raid visual controls, Expedition controls, Dungeon/Solo action pickers, Blacksmith, Moogle Emporium, Merc, Retainer, Fellowship, and inventory action spacing.

## Artwork and media safety

- Merc Service card frames now enforce the authored 3:4 viewport and use `object-fit: contain`, preventing card borders from being clipped if an asset is even slightly off-ratio.
- Shared media containers receive stronger width containment so portraits, item art, boss art, and card art cannot stretch their parent panels.
- Decorative scenic layers are explicitly non-interactive so they cannot intercept taps or text selection.

## Accessibility

- Adds a consistent high-visibility keyboard focus treatment across buttons, links, form controls, summaries, and card-style controls.
- Adds reduced-motion behavior for users who request it.
- Adds stronger high-contrast and forced-colors fallbacks.
- Maintains practical touch targets while keeping compact utility controls visually restrained.
- Improves Guide focus, wrapping, containment, and mobile form behavior to match the Portal.

## Compatibility

- Visible release remains **v1.8.2 — Elite Mercs**.
- Runtime remains `1.8.2-elite-mercs`.
- Database schema remains **18**.
- Hosted sync schema remains **1**.
- Portal Action protocol remains **35**.
- No player reset or database migration is required.
- Bot/gameplay code is unchanged by this UI/UX pass.
