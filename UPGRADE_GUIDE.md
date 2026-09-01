# Upgrade Guide — Crystal Guild v1.6.0 Gold Saucer Web

## From RC2H1

1. Preserve hosted secrets and persistent state.
2. Replace the Web tree with the v1.6.0 Web build or apply the RC2H1→v1.6.0 Web patch.
3. Deploy the matching v1.6.0 Bot.
4. Confirm `/api/health` reports runtime/frontend `1.6.0-gold-saucer`, hosted sync **1**, and Portal protocol **29**.
5. On a narrow/mobile viewport, open several Gold Saucer disclosures and confirm each finger pointer remains on the right side of its own header.
6. Confirm the regenerated Triple Triad card faces render and their printed values match gameplay.

No database migration is required from RC2.
