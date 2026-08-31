# Crystal Guild v1.6.0 — Gold Saucer Alpha 3 MGP Finalization Audit

## Scope
- Canonical currency name is **MGP — Manderville Gold Saucer Points**.
- Existing Gold Saucer balances are preserved numerically; no Web-side conversion exists.
- Web prefers Alpha 3 MGP fields while retaining Alpha 2 aliases strictly as rollout fallbacks.
- Welcome purse, daily floor, Mini Cactpot, Crystal Slots, Monster Toss, Prize Counter, odds, payouts, limits, records, and ownership are unchanged.

## Frozen contract
- Hosted/Web/Bot runtime family: `1.6.0-gold-saucer-a3`
- Frontend revision: `1.6.0-gold-saucer-a3`
- Schema **12** / hosted sync **1** / Portal protocol **27** / prefix `!`

## Validation
- Frontend: **487 / 487 PASS**
- Hosted Web/API: **51 / 51 PASS**
- Python parse: **10 / 10 PASS**
- Plain JS/MJS syntax: **179 / 179 PASS**
- Production Vite build not claimed because dependencies are intentionally absent from the source package.
