# Crystal Guild v1.5.0 — Trails & Raids Alpha 1 Hotfix 1 Validation Report

## Result
**PASS**

## Defect reproduced
The Alpha 1 Bot emitted the new sanitized public Raid Overlay field `last_mechanic`, while the hosted Web Overlay validator still used the older v1.4 allowlist. Authenticated Portal sync therefore failed closed with HTTP 400 (`Overlay snapshot contains unsupported field: last_mechanic`) and retried with backoff.

The same stale hosted contract would also have rejected other Alpha 1 fields when present: `encounter_type`, `encounter_name`, `mechanic`, `next_round_at`, and contribution `mitigation` / `score`.

## Fix coverage
- Hosted Overlay allowlist now matches the Alpha 1 Bot sanitizer contract.
- `mechanic` and `last_mechanic` remain restricted to the public telegraph/result keys emitted by the Bot.
- Mechanic text remains bounded; numeric progress fields must be non-negative integers.
- Contribution rows accept damage, healing, mitigation, and weighted score; names remain bounded and numeric values non-negative.
- Existing recursive forbidden-private-field validation still runs before the Overlay-specific shape checks.
- No Portal write action or combat-authority behavior changed.

## Automated validation
- Hosted Web/API Python suite: **47 / 47 PASS**.
- Frontend Node regression suite: **404 / 404 PASS** (frontend assets unchanged from Alpha 1).
- Hosted Web Python compile sweep: **8 / 8 PASS**.
- The hosted Overlay regression fixture now posts and reads back encounter type/name, Infernal Nails mechanic state, last mechanic, next-round timing, mitigation, and contribution score.

## Compatibility
- Hosted Web runtime: `1.5.0-trails-raids-a1h1`.
- Frontend asset revision: `1.5.0-trails-raids-a1` unchanged.
- Compatible Bot runtime: `1.5.0-trails-raids-a1` unchanged.
- Local DB schema: **10** unchanged.
- Hosted sync schema: **1** unchanged.
- Portal Action protocol: **25** unchanged.
- Bot update: **none**.
- Database migration / player reset: **none**.
- OAuth/environment/new variables: **none**.

## Source delta
Relative to the shipped Alpha 1 Web package: **14 changed files, 0 deletions; final Web tree remains 828 files**.

## Packaging verification
- Full Hotfix 1 Web archive: **828 / 828 exact frozen source files**.
- Alpha 1 → Hotfix 1 Web patch reconstruction: **828 / 828 exact files PASS**.
- Release ZIP CRC/integrity: **2 / 2 PASS**.
- Runtime/private-artifact hygiene: **0 violations**.
