# Portal Actions Setup — v1.3.0 Guild Expansion

Portal Action protocol is **22** and hosted sync schema remains **1**. Deploy the final Web and Bot together so the Portal contribution payload and Bot action handler stay on the same protocol.

Fellowship contributions include the project ID shown to the player so stale tabs fail closed after a streamer changes projects. Existing Workshop exchanges continue to use the allow-listed `WORKSHOP_EXCHANGE` action, and streamer Airship mission launches continue through the existing allow-listed `STREAMER_COMMAND` path.

Local database schema is **9** for persistent Fellowship/Airship state. No OAuth change or new environment variable is required from RC2.
