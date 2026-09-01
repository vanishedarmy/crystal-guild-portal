# Upgrade Guide — v1.6.0 Gold Saucer Alpha 5 Web Hotfix 4

Supported source: **Alpha 5 Web Hotfix 3** with the matching Alpha 5 Bot.

1. Preserve the live database, `.env`, Twitch token storage, hosted secrets, and persistent-disk state.
2. Apply the supplied **H3 → H4 Web patch**, or replace the Web source with the full Hotfix 4 Web package.
3. Keep the existing Alpha 5 Bot. No Bot replacement or database migration is required.
4. Restart/redeploy the Web service so the new frontend revision invalidates stale H3 browser/CDN assets.
5. Verify `/api/health` reports runtime `1.6.0-gold-saucer-a5`, frontend revision `1.6.0-gold-saucer-a5h4`, hosted sync 1, and Portal protocol 29.
6. Open Gold Saucer → Triple Triad and confirm the hero, card portraits, opponent portraits, board, context banners, and Win/Draw/Loss artwork appear.
7. Confirm the numbers around each card still come from the live Triple Triad values and are not baked into the artwork.
8. Collapse/expand Monster Toss, Chocobo Racing, Triple Triad, Prize Counter, Saucer Ledger, Recent Activity, and Future Attractions; confirm the shared finger changes from right-pointing to down-pointing.
9. Confirm Mini Cactpot and Crystal Slots remain permanently open.
10. Recheck the H2 quantity behavior: focusing an untouched quantity field showing `1` and typing `5` must result in `5`, not `15`.

No player reset, MGP conversion, OAuth/environment change, or gameplay rebalance is required. Schema remains 13.
