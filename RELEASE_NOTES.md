# Crystal Guild v1.2.0 — Expeditions Alpha 1 Hotfix 3

## Expedition Board artwork visibility fix
- Fixes the Distant Expedition Board map-room artwork rendering as only a thin strip at the top of the panel.
- The cause was the shared `.panel::before` accent rule retaining a 1px height after the Expedition Board supplied its own background image.
- The Expedition Board now explicitly resets that inherited height and fills the complete panel with the intended map-room artwork.
- Lightens the board-specific readability gradient so the map room is visibly present while controls and copy remain readable.
- Region-card and active-region artwork from Hotfix 2 are unchanged.
- Public release remains **v1.2.0 — Expeditions Alpha 1**; frontend asset revision advances to `1.2.0-expeditions-a1h3`.
- Web-only update. Portal Action protocol remains **20**, hosted sync schema remains **1**, and the compatible Bot remains `1.2.0-expeditions-a1h1` / local DB schema **8**.
