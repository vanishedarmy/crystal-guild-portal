# Portal Actions — v1.7.0 Retainer Service Alpha 1

Portal Action protocol is **30**.

Alpha 1 adds:
- `RETAINER_STATE` with `{}`
- `RETAINER_DISPATCH` with exactly `{ "assignment": "<assignment_id>" }`
- `RETAINER_COLLECT` with `{}`

Valid assignment IDs are `field_gathering`, `monster_salvage`, `mineral_survey`, `regional_procurement`, and `specialist_acquisition`. Hosted validation rejects unknown fields and unknown assignment IDs. The local Bot performs all authoritative Gil, timer, reward, inventory, Retainer EXP, and exactly-once settlement work.
