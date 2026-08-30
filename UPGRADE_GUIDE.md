# Upgrade Guide — Crystal Guild v1.4.0 — Dungeons & Delves Beta 3

Expected live baseline: **Beta 2 Web + Beta 1 Bot**.

1. Back up the current player database and persistent Twitch/token data.
2. Stop the Bot cleanly.
3. Apply the **Beta 1 → Beta 3 Bot patch** while preserving `.env`, the live database, token storage, and persistent-disk configuration.
4. Apply the **Beta 2 → Beta 3 Web patch** or deploy the full Beta 3 Web package.
5. Restart/redeploy Bot and Web together.
6. Verify `!cgversion` reports `1.4.0-dungeons-b3`, schema **10**, and protocol **25**.
7. Verify `/api/health` reports Web/frontend `1.4.0-dungeons-b3`, hosted sync schema **1**, and Portal Action protocol **25**.
8. On mobile/narrow view, confirm the Dungeon Board disclosure stays at the right edge and switches right-hand closed / down-hand open.
9. Confirm a stale Dungeon tab fails closed after another tab/connection advances the same run state, and refresh loads the latest state.
10. Confirm duplicate retry of the same pending action does not resolve twice.
11. Confirm all four Dungeons and existing player/Guild/Expedition state remain intact.

No database migration, protocol change, player reset, OAuth change, or new environment variable is required.
