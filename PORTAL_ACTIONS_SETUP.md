# Portal Actions — v1.4.0 Dungeons & Delves Beta 3

Portal Action protocol remains **25**. Beta 3 does not add or rename action types.

Dungeon mutations continue to submit exact run ID + chamber ID + persisted `revision`. The matching Beta 3 Bot now acquires database write intent before authoritative state validation so separate connections cannot concurrently spend the same revision. Same action-ID replay remains idempotent and is returned without resolving the action twice.

Bot/Web/frontend: `1.4.0-dungeons-b3`. Schema **10**, hosted sync **1**, protocol **25**. No migration, OAuth/environment change, or new environment variable is required.
