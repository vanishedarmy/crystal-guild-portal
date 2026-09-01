# Crystal Guild v1.7.0 — Retainer Service Alpha 1 Web

## Alpha 1

Retainer Service joins Guild Services as a Portal-only material-procurement feature. Every player has one lightweight personal Retainer and may run one timed assignment at a time.

The Portal shows Retainer Rank/EXP, lifetime assignment/material statistics, current assignment status and return countdown, secured returned hauls, bonus finds, and five procurement routes with Gil costs and rank gates.

Rewards are authoritative on the local Bot and committed at dispatch, so refreshes and reconnects cannot reroll them. Collection is exactly-once. Retainers do not store equipment or enter combat.

### Release contract

- Runtime/frontend: `1.7.0-retainer-a1`
- Paired Bot schema: **14**
- Hosted sync: **1**
- Portal protocol: **30**
- Gold Saucer/MGP behavior: unchanged from v1.6.0 production
- Moogle Emporium Annex: deferred to a later v1.7.0 phase
