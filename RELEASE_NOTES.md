# Crystal Guild v1.3.1 — UI Shared Assets Hotfix 1

## Web-only UI polish

This Web-only hotfix builds on **v1.3.1 Asset Optimization**. It adds shared collapse-pointer artwork and the Rally Venture scene background without changing gameplay, balance, progression, schemas, Portal actions, or the compatible Bot.

### Shared collapsible controls
- Adds a retro pixel pointer-hand pair for expanded and collapsed states.
- Uses the shared pointers across Adventure Board section buttons, Fellowship disclosures, Moogle sell details, Job unlock requirements, What's New history, Streamer Dashboard groups, and Player Guide expandable sections.
- Replaces text-chevron-only indicators where custom collapse controls were already present while keeping keyboard/focus behavior intact.

### Rally Venture presentation
- Adds a dedicated wide Rally Venture background to the Adventure Board.
- Uses a dark readability treatment above the art so live status, rules, reward information, and active encounter content remain legible.

### Asset discipline
- New pointer PNG sources were cropped, reduced to 96×96 UI assets, and stored as lossless WebP.
- Rally Venture artwork is stored as WebP; the shipping public tree remains **0 PNG**.
- Frontend asset revision advances to `1.3.1-asset-optimization-ui1` for cache busting.

### Compatibility
- Compatible Bot runtime: `1.3.1-asset-optimization`
- Hosted Web runtime: `1.3.1-asset-optimization`
- Frontend asset revision: `1.3.1-asset-optimization-ui1`
- Local DB schema: **9** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **22** unchanged
- Twitch prefix: `!`
- Database migration: **none**
- Player reset: **none**
- OAuth/environment changes: **none**
- Gameplay/economy changes: **none**
