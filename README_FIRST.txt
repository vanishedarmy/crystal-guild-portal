Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 5 — Gear Favorites Authority Fix
Web runtime/frontend: 1.7.1-resynthesis-a2h5
Paired Bot runtime: 1.7.1-resynthesis-a2h5
Local player DB schema: 16
Hosted sync schema: 1
Portal Action protocol: 33

Deploy this Web together with the matching schema-16/protocol-33 Bot. The authenticated Favorites endpoint now queues authoritative `SET_GEAR_FAVORITES` writes and treats the normal Bot player snapshot as the source of truth. Existing hosted/browser Favorites are retained only for migration or while a Bot write is pending.
