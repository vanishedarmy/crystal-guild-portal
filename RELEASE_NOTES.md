# Crystal Guild v1.9.0 Alpha 7 — Hall of Trophies

Alpha 7 turns the existing Trophy Hall profile destination into a permanent illustrated collection room.

## Hall of Trophies
- Adds **30 trophies**: 11 World Events, 5 Raids, 4 Hunts, 4 Triple Triad, and 6 Fellowship construction trophies.
- Adds dedicated artwork for every trophy plus Hall header, locked, secret, and completion presentation.
- Uses stable trophy IDs and compact hosted ownership snapshots.
- Adds category filtering, Hall Order / Recently Earned sorting, NEW markers, detail views, completion progress, and responsive/accessibility hardening.

## Persistence and reconciliation
- Matching Bot schema advances **19 → 20** with permanent `player_trophies` and exact `player_world_event_clears` history.
- Raid, Hunt, Triple Triad, and Fellowship accomplishments reconcile retroactively where authoritative records prove them.
- World Event history is deliberately conservative: older variants are never guessed from generic battle history.
- Group-content trophies are participant-specific; Fellowship trophies require a contributor record.

## Compatibility
- Runtime/frontend: `1.9.0-hall-of-trophies-alpha7`
- Local schema: **20**
- Hosted sync schema: **1**
- Portal Action protocol: **36**
- No player reset.
