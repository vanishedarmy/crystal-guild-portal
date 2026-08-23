# Crystal Guild v1.1.14 — Cloud Continuity Hotfix 3b

Hotfix 3b is a Web-only refinement on top of the certified Hotfix 3/3a line. The Bot runtime, Raid action fix, Rally Venture consolidation, selectable-control pass, database schema, hosted sync schema, and Portal Action protocol remain unchanged.

## Moogle Emporium — equipment stat comparison

Equipment cards in the Moogle Emporium now show their stat bonuses directly in the shop before purchase. The Portal enriches the lightweight shop rotation from the existing versioned `guide-data.json` item catalog, so the shop and Player Guide use the same equipment definitions.

For weapons, armor, and accessories, the card shows:

- the item's complete stat-boost line;
- a comparison against the currently equipped item in the same slot when one exists;
- the net stat delta, making upgrades and trade-offs visible at a glance;
- an explicit empty-slot note when no item is equipped in that slot.

No shop price, rotation, eligibility, inventory, or purchase logic changes.

## Jobs — compact cards, detailed pop-out

The Hotfix 3a Guide-style Job reference remains available, but the Jobs tab cards are restored to the compact pre-3a presentation. Job cards again focus on Job name, status, JLv/progress, signature, unlock requirements, and management actions.

The full reference now lives in **View <Job> Details**, including Combat Identity, Stat Growth, Battle Abilities with JLv/MP/AP/target information, Passive Job Milestones, and JLv.50 Cross-Job Mastery.

Public/read-only Job cards now also expose an explicit **View <Job> Details** button instead of relying only on whole-card activation.

## Compatibility

- Bot runtime: `1.1.14-cloud-continuity-h3` — unchanged
- Hosted Web runtime: `1.1.14-cloud-continuity-h3` — unchanged
- Frontend asset revision: `1.1.14-continuity3b`
- Hosted sync version/snapshots: `1.1.14-cloud-continuity`
- Local DB schema: 4
- Hosted sync schema: 1
- Portal Action protocol: 12
- Twitch prefix: `!`
- Database migration: none
- Player reset: none
- New Render secrets: none
- New OAuth scope: none
- Bot redeploy required from Hotfix 3a: no

Hotfix 2's subscriber authorization requirement (`channel:read:subscriptions`) remains unchanged if it has not already been completed.
