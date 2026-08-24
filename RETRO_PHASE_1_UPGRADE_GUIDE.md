# Crystal Guild v1.1.18 — Retro Phase 1 Upgrade Guide

Upgrade baseline: **v1.1.17 — Arsenal II Hotfix 5**.

Retro Phase 1 is **Web-only**. Keep the existing Hotfix 4 Bot runtime exactly as-is.

1. Preserve the hosted Web service environment variables and private/runtime state as normal.
2. Apply `CrystalGuild-v1.1.18-Retro-Phase1-Web-Patch-from-v1.1.17-Hotfix5.zip` over the current Hotfix 5 Web source, or replace the Web source with the full v1.1.18 Web package.
3. Push/deploy the updated Web source.
4. **Do not replace or redeploy the Bot.**
5. Verify hosted `/api/health` reports Web runtime `1.1.18-retro-phase-1` and frontend revision `1.1.18-retro-phase1`.
6. Verify `!cgversion` still reports Bot runtime `1.1.17-arsenal-ii-h4`.
7. Open Guild Heroes, a character profile, the Player Guide, and the Streamer Dashboard. Confirm the shared blue retro menu-window frame system is visible on each.
8. On mobile, confirm the top header still shows the brand icon on the left, LIVE/OFFLINE status, and hamburger page selector.
9. Confirm your signed-in character remains first in Guild Heroes and all remaining heroes remain sorted by level descending.

No schema migration or manual SQLite edit is required. Player progression is preserved.
