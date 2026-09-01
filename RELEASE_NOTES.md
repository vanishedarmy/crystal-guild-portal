# Crystal Guild v1.6.0 — Gold Saucer Alpha 5 Web Hotfix 2
## Gold Saucer + Quantity Input Recovery

### Gold Saucer render fix
- Hardens every live Gold Saucer display scalar before React renders it. Card names/values, course and pace copy, prize text, Monster Toss labels, Chocobo Racing labels, history details, and future-attraction copy now fail closed to safe text instead of allowing a malformed/legacy object value to trip the page-level error boundary.
- Keeps the Hotfix 1 eager Gold Saucer module path and partial-state normalization.
- The shared profile-section error boundary now logs the captured browser exception and offers a **Retry Section** control instead of leaving the player at a dead-end message.
- Gold Saucer gameplay, MGP balances, payouts, daily limits, and Triple Triad rules are unchanged.

### Moogle Emporium quantity input
- Fixes controlled quantity fields that previously initialized to `1` and appended typed digits (`5` becoming `15`).
- Focusing an untouched/default-one quantity clears the starter value, so desktop or mobile keyboard entry immediately replaces it.
- Empty fields normalize safely back to 1 on blur; min/max clamping and native number steppers remain supported.
- Applies to **Moogle Emporium Buy/Sell**, **Blacksmith crafting quantities**, and **Fellowship Workshop batches**, which shared the same starter-1 editing pattern.

### Gold Saucer collapsible contract
- Mini Cactpot: always open.
- Crystal Slots: always open.
- Monster Toss, Chocobo Racing, Triple Triad, Prize Counter, Saucer Ledger, Recent Activity, and Future Attractions: collapsible.

### Compatibility
- Hosted/Bot runtime: `1.6.0-gold-saucer-a5` unchanged.
- Frontend asset revision: `1.6.0-gold-saucer-a5h2`.
- Local DB schema: **13** unchanged.
- Hosted sync schema: **1** unchanged.
- Portal Action protocol: **29** unchanged.
- Twitch prefix: `!`.
- No database migration, player reset, OAuth/environment change, MGP conversion, or gameplay rebalance.
