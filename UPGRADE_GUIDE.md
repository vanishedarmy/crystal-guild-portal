# Upgrade Guide — v1.6.0 Gold Saucer Alpha 5 Web Hotfix 3

Supported source: **Alpha 5 Web Hotfix 2** with the matching Alpha 5 Bot.

1. Preserve the live database, `.env`, Twitch token storage, hosted secrets, and persistent-disk state.
2. Apply the supplied **H2 → H3 Web patch**, or replace the Web source with the full Hotfix 3 Web package.
3. Keep the existing Alpha 5 Bot. No Bot replacement or database migration is required.
4. Restart/redeploy the Web service.
5. Verify `/api/health` reports runtime `1.6.0-gold-saucer-a5`, frontend revision `1.6.0-gold-saucer-a5h3`, hosted sync 1, and Portal protocol 29.
6. Open Gold Saucer → Triple Triad and verify the scenic hero, card portraits, opponent portraits, illustrated board, and result artwork render.
7. Confirm the numbers around every card still match the live Triple Triad values supplied by the Bot.
8. Recheck the H2 fixes: Gold Saucer loads without the section crash, and typing `5` into an untouched quantity field showing `1` results in `5`, not `15`.

No player reset, MGP conversion, OAuth/environment change, or gameplay rebalance is required. Schema remains 13.
