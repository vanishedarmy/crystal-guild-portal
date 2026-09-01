# Upgrade Guide — Alpha 5 Hotfix 5

1. Deploy the matching **H5 Bot and H5 Web together**.
2. Preserve your existing database, environment variables, and hosted secrets.
3. No schema migration is required.
4. Verify `/api/health` reports runtime/frontend `1.6.0-gold-saucer-a5h5`, hosted sync **1**, Portal protocol **29**.
5. Hard-refresh the Portal once after deploy so `/gold-saucer/a5h5/triple-triad/` is requested.
6. Open Triple Triad and confirm full card faces show with no duplicate upper-left UI values.
7. Confirm the five starter cards use their printed values during captures.

Existing MGP balances, card collection, saved deck, records, and daily counters remain intact.
