Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 5 — HTTP Response Efficiency
Web runtime/frontend: 1.7.1-resynthesis-a2h5
Paired Bot runtime: 1.7.1-resynthesis-a2h5
Local player DB schema: 16
Hosted sync schema: 1
Portal Action protocol: 33

Deploy Bot and Web together. This transport-focused hotfix makes SSE the primary live-update path, adds conditional JSON revalidation, and sharply reduces fallback polling while preserving immediate event/deadline refresh behavior. Preserve hosted secrets and persistent runtime files. No schema migration or player reset is performed.
