# Portal Actions — v1.4.0 Dungeons & Delves

Portal Action protocol remains **25**. RC1 does not add, remove, or rename actions.

Dungeon mutations continue to submit exact run ID + chamber ID + persisted revision. Database write intent is acquired before authoritative state validation, and same action-ID replay remains idempotent.

Bot/Web/frontend: `1.4.0-dungeons-delves`. Schema **10**, hosted sync **1**, protocol **25**. No migration, OAuth/environment change, or new environment variable is required.
