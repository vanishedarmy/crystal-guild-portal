# v1.7.0 Retainer Service Alpha 1 Web — Finalization Audit

## Release decision

**PASS — canonical Alpha 1 Web baseline.** Built from the final v1.6.0 Gold Saucer Web production source and paired with the schema-14 / protocol-30 Alpha 1 Bot.

## Contract

- Runtime/frontend `1.7.0-retainer-a1`
- Paired local DB schema **14**
- Hosted sync **1**
- Portal Action protocol **30**
- Existing v1.6.0 Gold Saucer presentation, MGP economy, and Triple Triad card set are preserved.

## Retainer UI contract

- Retainer Service appears under Guild Services.
- Rank, EXP, lifetime statistics, assignment availability, Gil costs, rank gates, return timing, completed haul, bonus finds, and collection are represented from authoritative state.
- `RETAINER_STATE`, `RETAINER_DISPATCH`, and `RETAINER_COLLECT` use protocol-30 Portal actions.
- Retainer activity is Portal-only and does not add routine Twitch chat output.

## Automated gates

- Frontend regression: **531 / 531 PASS**
- Hosted Web/API regression: **58 / 58 PASS**
- Node JS/MJS syntax: **194 / 194 PASS**
- Web Python AST parse: **13 / 13 PASS**
- CSS structural checks: **8 / 8 PASS**
- WebP decode: **815 / 815 PASS**
- Public PNG count: **0**

The source-only archive does not include installed `node_modules`, so a local Vite production build is not claimed as a gate.

## Packaging gates

- **PASS** — the v1.6.0→Alpha 1 Web patch reproduces the full Alpha 1 Web source byte-for-byte after application to a clean v1.6.0 Web baseline.
- **PASS** — the full Web ZIP reproduces the verified Alpha 1 Web source byte-for-byte after extraction.
- **PASS** — the Complete package contains a byte-identical copy of this verified Web tree.
- **PASS** — all release ZIPs pass archive-integrity checks and exclude live databases, `.env`, Python caches/bytecode, and runtime overlay/checkpoint state.
