# Portal Actions — v1.4.0 Dungeons & Delves Beta 2

Portal Action protocol remains **25**. Beta 2 does not change the action contract introduced in Beta 1.

Dungeon mutations continue to submit the exact persisted Dungeon `revision` together with run ID and chamber ID. `DUNGEON_ACTION`, `DUNGEON_CONTINUE`, `DUNGEON_CHOICE`, and `DUNGEON_RETREAT` fail closed when the submitted state is stale, while same-action replay remains idempotent.

Compatible Bot: `1.4.0-dungeons-b1`. Hosted Web/frontend: `1.4.0-dungeons-b2`. No schema migration, OAuth change, environment-variable change, or Bot update is required.
