# Crystal Guild Portal Actions — v1.1.15 Wayfarer

Portal Action protocol is **13**. The browser still uses the strict authenticated action relay; arbitrary Twitch/chat command execution is not exposed.

Wayfarer retains all protocol-12 actions and adds four typed Solo Venture flows:

- `SOLO_EXPEDITION_ACTION` with exactly one `action` value: `attack`, `defend`, `ability:<id>`, or `item:<id>`;
- `SOLO_EXPEDITION_CONTINUE` with no payload;
- `SOLO_EXPEDITION_RETURN` with no payload;
- `SOLO_EXPEDITION_RETREAT` with no payload.

`SOLO_VENTURE` still begins the run and accepts no payload. Rally `VENTURE` / `JOIN_ENCOUNTER` remain Twitch-chat-only and are not restored to the Portal contract.

The hosted Web validates the exact action shape before queueing it. The Bot remains authoritative for ownership, current Solo Venture state, Job level, MP/AP, inventory quantity, status restrictions, combat math, rewards, and replay/idempotency receipts.

Deploy matching `1.1.15-wayfarer` Bot/Web builds. Hosted sync schema remains **1** and no new Render secret is required.
