# Portal Actions Setup — v1.3.0 Guild Expansion Alpha 3

Alpha 3 advances Portal Action protocol **20 → 21** by adding the typed `WORKSHOP_EXCHANGE` action. Deploy Web and Bot runtime `1.3.0-guild-expansion-a3` together. Hosted sync schema remains **1** and local Bot DB schema remains **8**. No OAuth or environment-variable changes are required.

`WORKSHOP_EXCHANGE` accepts only:
- `exchange_id` — the published Workshop service ID
- `batches` — integer **1–20**

The hosted Web validates the request shape before queueing it; the Bot independently validates player state, Workshop level, resources, and the selected exchange before applying the transaction.
