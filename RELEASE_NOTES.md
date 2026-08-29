# Crystal Guild v1.3.1 — UI Shared Assets Hotfix 2

## Web-only collapse-control and Rally Venture fix

Hotfix 2 builds on **v1.3.1 UI Hotfix 1** and makes no gameplay, economy, progression, schema, Portal Action, or Bot changes.

### Collapse-control consistency
- All shared collapsible surfaces now use the **same right-pointing retro hand** in both closed and open states.
- Removes visible `Expand`, `Collapse`, `Show Atlas`, and `Hide Atlas` text from the small section-control buttons.
- Buttons retain descriptive `aria-label` and `title` text for accessibility/tooltips.
- Fellowship, Streamer Dashboard, Player Guide, Moogle/Jobs/What's New details, and Adventure Board controls share the same hand language.
- Player Guide generated chevrons are replaced by the hand graphic instead of rotating glyphs.

### Rally Venture background fix
- Applies `rally_venture.webp` directly to the Rally Venture panel background instead of placing it on a pseudo-element.
- This removes the stacking conflict that could leave the tab looking like a plain navy panel.
- Readability gradients remain above the artwork, with the scene made more visible across wide and compact layouts.

### Compatibility
- Compatible Bot runtime: `1.3.1-asset-optimization`
- Hosted Web runtime: `1.3.1-asset-optimization`
- Frontend asset revision: `1.3.1-asset-optimization-ui2`
- Local DB schema: **9** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **22** unchanged
- Twitch prefix: `!`
- Database migration / player reset / OAuth / environment changes: **none**
- Gameplay/economy changes: **none**
