# Portal Actions — v1.9.0 Alpha 12

Portal Action protocol **38**, hosted sync **1**. Deploy matching `1.9.0-camp-recovery-alpha12` Web and Bot source packages together, preserving all OAuth/session keys, secrets and private sync configuration.

Two new strictly shaped, server-authoritative mutations: `CAMP_EAT_MEAL` accepts an empty object; `CAMP_SET_PREPARATION` accepts exactly one `preparation` string, either `scout`, `sharpen` or `supplies`. Both use the existing session CSRF, signed-in Twitch identity, replay-safe action receipts and per-user mutation queue. A new meal consumes one owned Trail Rations; arbitrary client buffs, item IDs, quantities or player IDs are rejected. Local Bot schema 24 saves pending meal/preparation state; hosted sync schema 1 is unchanged.

See `UPGRADE_GUIDE.md` for matching deploy and database backup instructions.
