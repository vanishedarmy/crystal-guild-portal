# Hosting Guide — v1.7.1 Resynthesis Alpha 2

Deploy the Alpha 2 Bot and Web together. Runtime/frontend identity is `1.7.1-resynthesis-a2`; schema remains **15**, hosted sync **1**, and Portal Action protocol **32**.

Preserve hosted secrets, persistent state, the live database, and existing OAuth/session configuration. No database migration is required. The Gold Saucer rebalance changes authoritative Bot-side payout values, so the paired Bot must be deployed with this Web build.
