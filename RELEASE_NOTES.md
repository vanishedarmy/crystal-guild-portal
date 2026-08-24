# Crystal Guild v1.1.16 — Arsenal Hotfix 2 Release Notes

Arsenal Hotfix 2 repairs Portal action recovery after reports of **Daily Guild Provisions remaining stuck in an updating state**, the hosted action queue reaching **“Too many … waiting for the Bot”**, and interactive **Solo Venture appearing frozen after an action**.

## Portal queue recovery

The hosted relay now treats read-only state refreshes differently from gameplay mutations:

- identical state requests are coalesced instead of filling the per-player queue;
- duplicate pending state refreshes left by older Web builds are compacted automatically on the next request;
- read-only state refreshes no longer consume the gameplay-action queue budget;
- gameplay mutations are claimed ahead of ordinary state refreshes, so Attack/Ability/claims are not starved behind page polling;
- identical in-flight Daily/Solo/Hunt requests are reused rather than queued again.

This is recovery logic, not a player reset. Existing pending rows do not need to be deleted manually.

## Daily Guild Provisions

Daily Provision state and claim requests now keep one stable browser idempotency key while a request is outstanding. Refresh/retry therefore checks the same authoritative request rather than creating a new one.

The Daily card also prevents overlapping state requests and automatically re-checks a delayed state response. Subscriber-tier Daily bonuses and the randomized 24-hour reward design are unchanged.

## Solo Venture recovery

The Adventure Board now treats an active interactive Solo Venture as live state that deserves periodic authoritative refreshes. Previously, only shared encounters and timed Hunts enabled that polling path. If a Solo action finished after the browser wait window, the backend could advance while the card remained on the previous round until another page interaction.

Hotfix 2 adds:

- periodic Adventure Board refresh while a Solo Venture is active;
- a single in-flight Adventure-state request guard;
- stable idempotency keys for Solo Venture start, Attack, Defend, Ability, Item, Continue, Return and Retreat actions;
- safe retry/resume wording instead of encouraging repeated queue submissions;
- hosted coalescing for identical in-flight Solo requests, protecting against duplicate round execution during slow responses.

No Solo Venture rewards, stage odds, cooldowns, combat balance or Wayfarer progression rules are changed.

## Compatibility

- Bot runtime: `1.1.16-arsenal-h1` (**unchanged**)
- Hosted Web runtime: `1.1.16-arsenal-h2`
- Frontend asset revision: `1.1.16-arsenal1h2`
- Local DB schema: **5** (unchanged)
- Hosted sync schema: **1** (unchanged)
- Hosted sync compatibility: `1.1.15-wayfarer` (unchanged)
- Portal Action protocol: **14** (unchanged)
- Twitch prefix: `!`

Hotfix 2 is **Web-only**. It requires no database migration, Bot replacement/restart, new Render secret, OAuth change or player reset.
