# Crystal Guild Portal Actions — v1.1.16 Arsenal

Portal Action protocol is **14**. The browser still uses the strict authenticated action relay; arbitrary Twitch/chat command execution is not exposed.

Arsenal retains the established typed Portal actions. Protocol 14 includes authenticated Title management and the four typed Solo Venture flows:

- `SET_TITLE` with exactly one earned `title_id`;

- `SOLO_EXPEDITION_ACTION` with exactly one `action` value: `attack`, `defend`, `ability:<id>`, or `item:<id>`;
- `SOLO_EXPEDITION_CONTINUE` with no payload;
- `SOLO_EXPEDITION_RETURN` with no payload;
- `SOLO_EXPEDITION_RETREAT` with no payload.

`SOLO_VENTURE` still begins the run and accepts no payload. Rally `VENTURE` / `JOIN_ENCOUNTER` remain Twitch-chat-only and are not restored to the Portal contract.

The hosted Web validates the exact action shape before queueing it. The Bot remains authoritative for ownership, current Solo Venture state, Job level, MP/AP, inventory quantity, status restrictions, combat math, rewards, and replay/idempotency receipts.

Deploy matching `1.1.16-arsenal` Bot/Web builds. Hosted sync schema remains **1**, hosted sync compatibility remains `1.1.15-wayfarer`, and no new Render secret is required.
