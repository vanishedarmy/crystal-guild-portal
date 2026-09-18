# Crystal Guild v1.8.0 Final — Expedition UI Polish

This frontend-only polish pass refines the Chocobo Expedition Board without changing Expedition balance, rewards, combat math, save data, schemas, or Portal action protocol.

## Player-facing improvements

- Reworked the active Expedition information hierarchy into clear **Expedition Status**, **Expedition Cache**, **Journal**, and current-action areas.
- Increased panel contrast and readability over regional background artwork while preserving the existing Expedition visual identity.
- Active Expedition status uses a five-column desktop layout so the Completion Stipend no longer falls into an orphaned second row at common desktop widths.
- Strengthened hover, focus, selected, and ready states for Expedition setup and action controls.
- Route choices are now deliberate selectable cards with a persistent selected state and a separate full-width **Travel** action.
- Route cards clearly show risk, signals, rare-event chance, reward multiplier, and whether the route is selected.
- Combat controls are separated into **Core Actions**, **Abilities**, and **Consumables** instead of one undifferentiated button wall.
- Job abilities are grouped into **Offense**, **Restoration**, and **Support** sections.
- Ability costs now display their resource label (for example, `8 MP` or `6 AP`) instead of a bare number.
- Consumables are organized into **Healing**, **Support**, and **Damage** categories and only one category is shown at a time.
- Consumable cards retain quantity, availability, and effect copy for faster scanning.
- Mobile layouts stack route cards, action sections, and consumable categories cleanly while preserving touch targets.

## Compatibility

- Runtime/frontend remains `1.8.0-merc-final`.
- Local database schema remains **17**.
- Hosted sync schema remains **1**.
- Portal Action protocol remains **34**.
- No player reset or migration.
- Bot package is unchanged from v1.8.0 Final.
