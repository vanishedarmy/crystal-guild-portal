# Upgrade Guide — Crystal Guild v1.7.0 Retainer Service Alpha 1 Web

## From v1.6.0 production

1. Preserve hosted secrets and persistent state.
2. Deploy the matching v1.7.0 Alpha 1 Bot and allow its schema 13→14 migration to finish.
3. Replace the Web tree with this Alpha 1 build or apply the v1.6.0→Alpha 1 Web patch.
4. Confirm `/api/health` reports runtime/frontend `1.7.0-retainer-a1`, hosted sync **1**, and Portal protocol **30**.
5. Open your own Adventurer Portal → **Retainer Service** and confirm the state/dispatch/collect capabilities are available.
6. Verify existing Gold Saucer MGP balances and attractions are unchanged.

No new hosted environment variable is required.
