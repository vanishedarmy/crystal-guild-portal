# Passive Recovery Hotfix — Validation Report

## Automated validation
- Bot regression suite: **254/254 PASS**
- Frontend regression suite: **46/46 PASS**
- Hosted Web/API suite: **pending final run**

## Contract
- Long Rest threshold: exactly 8 hours.
- Stream refresh: once per unique Twitch stream `started_at` session.
- DB schema remains 5.
- Hosted sync schema remains 1.
- Portal Action protocol remains 14.
