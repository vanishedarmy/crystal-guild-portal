# Crystal Guild v1.1.18 — Retro Phase 1 Hotfix 1 Upgrade Guide

Upgrade baseline: **v1.1.18 — Retro Phase 1**.

Hotfix 1 is **Web-only**. Keep the existing Bot exactly as-is.

1. Preserve the hosted Web environment variables and private/runtime state as normal.
2. Apply `CrystalGuild-v1.1.18-Retro-Phase1-Hotfix1-Web-Patch-from-Retro-Phase1.zip` over the current v1.1.18 Retro Phase 1 Web source, or replace the Web source with the full Hotfix 1 Web package.
3. Push/deploy the updated Web source.
4. Do **not** replace or redeploy the Bot.
5. Verify hosted `/api/health` still reports Web runtime `1.1.18-retro-phase-1` and now reports frontend revision `1.1.18-retro-phase1h1`.
6. Start or resume a Solo Venture encounter and open **Ability**.
7. Confirm only currently usable abilities appear.
8. Confirm every visible ability shows only its name and MP/AP cost.
9. Confirm unavailable abilities disappear from the picker when resources or combat state make them unusable.
10. Check desktop and mobile widths for the condensed row layout.

No schema migration or manual SQLite edit is required. Player progression is preserved.
