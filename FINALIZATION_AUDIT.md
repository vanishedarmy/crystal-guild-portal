# Crystal Guild v1.6.0 — Gold Saucer Alpha 4 Release Audit

- Chocobo Racing is open in the Gold Saucer using the existing registered companion.
- Portal UI exposes course gates, pace choices, daily entries, last result, racing records, and MGP payouts.
- `CHOCOBO_RACE` is validated by the hosted relay and executed authoritatively by the Bot.
- Triple Triad remains Coming Soon.
- Frozen contract: runtime/frontend `1.6.0-gold-saucer-a4`; local DB schema 12; hosted sync 1; Portal Action protocol 28; prefix `!`.

Release gate: **490 / 490 frontend tests PASS**, **53 / 53 hosted Web/API tests PASS**, TypeScript-parser **222 / 222 PASS**, Node syntax **180 / 180 PASS**, CSS **8 / 8 PASS**, and WebP decode **692 / 692 PASS**. The local Vite production build is not claimed because this source package omits `node_modules`.
