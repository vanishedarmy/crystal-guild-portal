# Portal Actions Setup — v1.2.0 Expeditions Alpha 1

Portal Action protocol is **20**. Deploy Web runtime `1.2.0-expeditions-alpha1` together with Bot runtime `1.2.0-expeditions-a1`. Hosted sync schema remains **1** and local Bot DB schema is **8**.

v1.2 adds typed Expedition actions: `EXPEDITION_START`, `EXPEDITION_RESOLVE_STAGE`, `EXPEDITION_ACTION`, `EXPEDITION_CONTINUE`, `EXPEDITION_CAMP`, `EXPEDITION_RETURN`, and `EXPEDITION_RETREAT`. Existing Portal actions retain their prior security, CSRF, idempotency, lease, and Twitch-ID binding behavior.
