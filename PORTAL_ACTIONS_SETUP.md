# Crystal Guild Portal Actions — v1.1.14 Cloud Continuity

Portal Action protocol remains **12**. Browser mutations continue to use the strict authenticated action relay; v1.1.14 does not add arbitrary command execution.

The new `/api/sync/overlay` endpoint is part of the private Bot-to-Web snapshot sync path, not the player action protocol. It requires the existing `X-Crystal-Guild-Key`/`PORTAL_SYNC_KEY` and accepts only a bounded presentation-safe raid payload.

Deploy matching v1.1.14 Bot and Web builds for Fellowship self-healing and hosted OBS overlay support.
