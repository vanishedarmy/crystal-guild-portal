# Upgrade Guide — v1.6.0 Gold Saucer RC1 Web

1. Deploy the matched RC1 Bot first or in the same maintenance window.
2. Replace the Web tree with the full RC1 Web package or apply the H6 → RC1 Web patch.
3. Preserve hosted environment variables, OAuth configuration, sync keys, and persistent data.
4. Hard-refresh once after deployment.
5. Confirm `/api/health` reports runtime `1.6.0-gold-saucer-rc1`, frontend `1.6.0-gold-saucer-rc1`, hosted sync **1**, and Portal protocol **29**.
6. Open Gold Saucer and confirm all five attractions render, Triple Triad full card faces remain visible, and existing MGP/records/collection data are intact.

No schema migration is introduced by RC1.
