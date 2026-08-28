# Validation Report — v1.2.0 Expeditions Alpha 1 Hotfix 3

## Identity
- Hosted Web runtime: `1.2.0-expeditions-alpha1`
- Frontend asset revision: `1.2.0-expeditions-a1h3`
- Compatible Bot runtime: `1.2.0-expeditions-a1h1`
- Portal Action protocol: **20**
- Hosted sync schema: **1**
- Local Bot DB schema: **8**

## Hotfix 3 validation
- Frontend Node regression suite: **298 / 298 passed**.
- Hosted Portal Python suite: **47 / 47 passed**.
- Regression coverage verifies the Expedition Board pseudo-element resets the shared 1px panel accent height before applying the map-room backdrop.
- The packaged `/expeditions/expedition-board.webp` is the generated map-room artwork and remains routed to the Distant Expedition Board.
- The Board overlay was lightened while retaining a dark readability gradient behind player controls.
- Region artwork, Travel Regions collapse behavior, Hunt Board collapse behavior, and Hotfix 2 readability cleanup remain unchanged.
- No Bot, database, hosted schema, Portal protocol, OAuth, or environment-variable changes are required.
