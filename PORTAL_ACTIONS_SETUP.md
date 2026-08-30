# Portal Actions — v1.4.0 Dungeons & Delves Beta 1

Portal Action protocol advances **24 → 25**. Beta 1 adds a persisted Dungeon `revision` to every Dungeon mutation payload. The Bot accepts a Dungeon mutation only when the submitted run ID, chamber ID, and revision all match the current authoritative run.

This closes same-room stale tabs while retaining existing action-ID replay/idempotency behavior. `DUNGEON_ACTION`, `DUNGEON_CONTINUE`, `DUNGEON_CHOICE`, and `DUNGEON_RETREAT` all use the exact-state contract.

Deploy matching Beta 1 Web and Bot together. No schema migration, OAuth change, or new environment variable is required.
