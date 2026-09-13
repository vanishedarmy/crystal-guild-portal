# Validation Report — Battle Item Purpose Sort

**PASS — shipping archive validated after extraction.**

- Frontend: **612 / 612 PASS**
- Hosted Web/API: **76 / 76 PASS**
- Paired Bot: **708 / 708 PASS** (+ 30 subtests) — Bot source is unchanged from the current backend baseline.
- Focused purpose-sort regressions: **5 / 5 PASS** (included in frontend total)

Focused coverage verifies restorative → cure → support → damage ordering, disabled restorative classification, structured-effect classification for future items, alphabetical ordering inside a purpose group, and non-mutating sort behavior.

Solo Venture, Dungeon, and Expedition battle-item selectors all use the same shared semantic sorter. No item-effect, inventory, encounter, transport, or player-state behavior changed.

Release contract remains runtime `1.7.1-resynthesis-a2h5`, schema **16**, hosted sync **1**, Portal protocol **33**. No migration/reset.
