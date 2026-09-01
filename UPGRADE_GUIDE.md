# Upgrade Guide — v1.6.0 Gold Saucer Alpha 4 Web Hotfix 1

Supported source: the canonical Alpha 4 Chocobo Racing Web build with the matching Alpha 4 Bot.

1. Preserve hosted secrets, OAuth state, persistent storage, and the live player database.
2. Replace the Web source with the full Hotfix 1 Web package, or apply the supplied patch over the canonical Alpha 4 Web source.
3. Keep the existing Alpha 4 Bot; no Bot replacement is required for this Web-only hotfix.
4. Redeploy/restart the hosted Web service.
5. Verify `/api/health` reports hosted runtime `1.6.0-gold-saucer-a4`, frontend asset revision `1.6.0-gold-saucer-a4h1`, hosted sync schema 1, and Portal protocol 28.
6. Open Gold Saucer → Chocobo Racing and verify the hero scene, three illustrated course cards, three illustrated pace cards, and last-race artwork.
7. Check a narrow/mobile viewport and confirm the course cards stack, pace cards remain readable, and the Race Now action spans the available width.

No database migration or player reset is required. Existing MGP balances and Alpha 4 race records are unchanged.
