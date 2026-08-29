# Crystal Guild v1.3.1 — UI Shared Assets Hotfix 4

## Render-path correction

UI4 replaces the two fragile CSS-only mechanisms from UI1–UI3 with explicit rendered image elements. No gameplay, balance, progression, Bot, schema, or Portal Action behavior changes.

### Rally Venture background
- Rally Venture now renders `rally_venture.webp` as a real absolutely positioned `<img>` inside the panel.
- The standard `.panel` background may remain underneath it, but can no longer replace or suppress the Rally artwork.
- Text and controls render above the artwork with the existing panel framing preserved.

### Collapse pointers
- React-controlled collapsibles now render the pointer as a real `<img>` selected directly from component state: **right when closed, down when open**.
- Native `<details>` disclosures use explicit right/down image elements and CSS only to choose which element is visible from the actual `open` attribute.
- Visible Expand/Collapse text remains removed; aria-label/title accessibility text remains.
- Inventory groups are brought into the same pointer language.

### Compatibility
- Compatible Bot runtime: `1.3.1-asset-optimization`
- Hosted Web runtime: `1.3.1-asset-optimization`
- Frontend asset revision: `1.3.1-asset-optimization-ui4`
- Local DB schema: **9**
- Hosted sync schema: **1**
- Portal Action protocol: **22**
- Twitch prefix: `!`
- Bot/database/OAuth/environment/gameplay changes: **none**
