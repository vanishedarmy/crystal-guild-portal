# Crystal Guild v1.1.17 — Arsenal II Hotfix 5 Upgrade Guide

Upgrade baseline: **v1.1.17 — Arsenal II Hotfix 4**.

Hotfix 5 is **Web-only**. Keep the Hotfix 4 Bot exactly as-is.

1. Preserve the hosted Web service environment variables and private/runtime state as normal.
2. Apply `CrystalGuild-v1.1.17-Arsenal-II-Hotfix5-Web-Patch-from-Hotfix4.zip` over the current Hotfix 4 Web source, or replace the Web source with the full Hotfix 5 Web package.
3. Push/deploy the updated Web source.
4. Do **not** replace or redeploy the Bot for this hotfix.
5. Verify hosted `/api/health` reports runtime `1.1.17-arsenal-ii-h4` and frontend revision `1.1.17-arsenal-ii1h5`.
6. Sign in with a Twitch account linked to a Crystal Guild character and open **Guild Heroes**.
7. Confirm your character card is first even when another hero has a higher level.
8. Confirm all remaining cards are ordered from highest character level to lowest.
9. Use Search and confirm the same priority/order applies within the filtered results.

No schema migration or manual SQLite edit is required. Player progression is preserved.
