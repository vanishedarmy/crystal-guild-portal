# Upgrade Guide — v1.6.0 Gold Saucer Alpha 5 Web Hotfix 2

Supported source: Gold Saucer Alpha 5 Web or Alpha 5 Web Hotfix 1 with the matching Alpha 5 Bot.

1. Preserve the live database, `.env`, Twitch token storage, hosted secrets, and persistent-disk state.
2. If Alpha 5 Hotfix 1 is already deployed, apply the supplied **H1 → H2 Web patch**. Otherwise replace the Web source with the full Hotfix 2 Web package.
3. Keep the existing Alpha 5 Bot; no Bot replacement is required for this Web-only hotfix.
4. Restart/redeploy the Web service.
5. Verify `/api/health` reports hosted runtime `1.6.0-gold-saucer-a5`, frontend asset revision `1.6.0-gold-saucer-a5h2`, hosted sync 1, and Portal protocol 29.
6. Open Gold Saucer and confirm the floor renders. Mini Cactpot and Crystal Slots should remain open; the other requested sections should remain collapsible.
7. In Moogle Emporium, focus a quantity field showing `1` and type `5`; the field should become `5`, not `15`. Verify the same behavior on mobile.

No database migration or player reset is required. Schema remains 13.
