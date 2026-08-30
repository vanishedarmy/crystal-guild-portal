# Crystal Guild v1.5.0 — Trails & Raids Alpha 1 Hotfix 1

## Hosted Overlay contract repair

The original Alpha 1 Bot correctly sanitized and emitted the new public Trial/Raid Overlay fields, but the hosted Web validator still used the older Overlay allowlist. This caused authenticated Portal sync to fail closed with HTTP 400, commonly reporting `Overlay snapshot contains unsupported field: last_mechanic`.

### Fixed
- Hosted Overlay sync now accepts Alpha 1 `encounter_type` and `encounter_name`.
- Accepts sanitized `mechanic` and `last_mechanic` payloads used by Trial telegraphs and resolved-mechanic presentation.
- Accepts `next_round_at` for live round timing.
- Contribution rows now accept `mitigation` and weighted `score` alongside damage/healing.
- New fields remain shape-, size-, and non-negative-value validated; the existing forbidden-private-field scan remains intact.

### Compatibility
- Hosted Web runtime: `1.5.0-trails-raids-a1h1`
- Frontend asset revision: `1.5.0-trails-raids-a1` unchanged
- Compatible Bot runtime: `1.5.0-trails-raids-a1` unchanged
- Local DB schema: **10** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **25** unchanged
- Player reset: **none**
- Database migration: **none**
- Bot update: **none**
- OAuth/environment/new variables: **none**

Deploy only the Web hotfix, then restart/redeploy the hosted Web service.
