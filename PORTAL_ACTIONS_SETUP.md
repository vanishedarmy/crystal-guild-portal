# Portal Actions — v1.5.0 Trails & Raids Alpha 1

Portal Action protocol remains **25**. Alpha 1 does not add, remove, or rename Portal actions; the Raid Board is read-only.

Dungeon mutations continue to submit exact run ID + chamber ID + persisted revision. Database write intent is acquired before authoritative state validation, and same action-ID replay remains idempotent.

Bot/Web/frontend: `1.5.0-trails-raids-a1`. Schema **10**, hosted sync **1**, protocol **25**. No migration, OAuth/environment change, or new environment variable is required.
