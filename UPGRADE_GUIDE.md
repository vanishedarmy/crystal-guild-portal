# Upgrade Guide — v1.6.0 Gold Saucer Alpha 4 Web

Deploy this Web with the matching Alpha 4 Bot. Portal Action protocol advances from 27 to **28** for `CHOCOBO_RACE`; do not intentionally leave Web and Bot on different Gold Saucer alpha protocols.

Preserve hosted secrets and persistent state, replace the Web source, redeploy, and verify `/api/health` reports hosted runtime/frontend `1.6.0-gold-saucer-a4`, hosted sync 1, and Portal protocol 28. No local database migration is required; the Bot remains schema 12.
