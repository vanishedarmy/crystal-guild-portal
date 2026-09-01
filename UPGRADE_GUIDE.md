# RC2 → RC2 Web Hotfix 1 Upgrade

1. Keep the existing RC2 Bot/runtime unchanged.
2. Replace the Web tree or apply the RC2→RC2H1 Web patch.
3. Preserve hosted secrets and persistent state. No database migration is required.
4. Confirm `/api/health` reports runtime `1.6.0-gold-saucer-rc2`, frontend assets `1.6.0-gold-saucer-rc2h1`, hosted sync **1**, and Portal protocol **29**.
5. Hard refresh once after deploy if a browser tab was already open. Card URLs are cache-busted, so normal subsequent loads use the regenerated faces.

# Upgrade Guide — v1.6.0 Gold Saucer RC2 Web

1. Deploy the matched RC2 Bot first or in the same maintenance window.
2. Replace the Web tree with the full RC2 Web package or apply the **RC1 → RC2 Web patch**.
3. Confirm `/api/health` reports runtime `1.6.0-gold-saucer-rc2` / frontend `1.6.0-gold-saucer-rc2h1`, hosted sync **1**, and Portal protocol **29**.
4. Open Gold Saucer and verify Mini Cactpot shows the RC2 payout values and the Saucer Ledger shows Cactpot W / D / L.
5. Verify H5 full Triple Triad faces, H6 opponent layout, Gold Saucer finger-pointer collapsibles, and Mini Cactpot/Crystal Slots fixed-open behavior remain intact.

No schema migration is introduced by RC2.
