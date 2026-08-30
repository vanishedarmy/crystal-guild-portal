# Portal Actions — v1.5.0 Trails & Raids Alpha 1 Hotfix 1

Portal Action protocol remains **25**. Hotfix 1 is a hosted Overlay read/sync compatibility repair and does not add, remove, or rename Portal actions. The Raid Board remains read-only.

Dungeon mutations continue to submit exact run ID + chamber ID + persisted revision. Database write intent is acquired before authoritative state validation, and same action-ID replay remains idempotent.

Hosted Web runtime: `1.5.0-trails-raids-a1h1`; frontend and compatible Bot remain `1.5.0-trails-raids-a1`. Schema **10**, hosted sync **1**, protocol **25**. No migration, OAuth/environment change, new environment variable, or Bot update is required.
