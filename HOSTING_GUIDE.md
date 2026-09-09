# Hosting Guide — Hotfix 5 Gear Favorites Authority Fix

This is **not Web-only**. Deploy this Web package together with the matching schema-16 / Portal-protocol-33 Bot. Runtime/frontend remains `1.7.1-resynthesis-a2h5`; hosted sync schema remains **1**.

Preserve hosted secrets, persistent state, OAuth/session configuration, and the live player database. The local schema **15 → 16** migration is performed by the Bot after creating a verified pre-migration backup. The hosted Portal itself needs no new environment variables.

The authenticated Favorites endpoint queues `SET_GEAR_FAVORITES`; the normal Bot snapshot is authoritative after that action is persisted.
