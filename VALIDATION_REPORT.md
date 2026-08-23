# Crystal Guild v1.1.14 — Cloud Continuity Hotfix 3b Validation

## Certification summary

**PASS — Moogle Emporium stat-comparison + compact Jobs/details refinement certified.**

Hotfix 3b is Web-only. Bot gameplay/runtime behavior from Hotfix 3 remains unchanged.

## Automated validation

- Bot automated tests: **342 / 342 PASS**
- Frontend source/unit/regression tests: **155 / 155 PASS**
- Hosted Portal/API tests: **39 / 39 PASS**
- JavaScript/JSX independent TypeScript syntax parse: **50 / 50 PASS**
- Python 3.11 grammar sweep: **72 / 72 PASS**
- Exact extracted Web package: **155 / 155 frontend + 39 / 39 hosted PASS**
- Exact extracted Complete package Bot: **342 / 342 PASS**
- Hotfix 3a → 3b Web patch overlay: **PASS — byte-for-byte final Web tree**
- Hotfix 2 → 3b consolidated overlay: **PASS — byte-for-byte final Complete tree**

## Hotfix 3b regression coverage

Validation confirms that:

- Moogle Emporium stock is enriched from the existing versioned Guide item catalog;
- equipment cards display a **Stat boosts** summary before purchase;
- the Novice Robe resolves to **VIT +2 · SPR +5 · MAG +2 · HP +15** from the shared catalog;
- equipment cards compare offered gear against the currently equipped item in the matching weapon/armor/accessory slot;
- the comparison uses effective equipped bonuses, so forge upgrades are represented in the current-item side of the delta;
- ordinary consumable/material shop cards do not gain irrelevant equipment-stat panels;
- Jobs cards no longer inline the large Battle Ability/passive/Mastery reference;
- both owner and public/read-only Job cards expose an explicit **View <Job> Details** action;
- the Job detail pop-out retains Combat Identity, Stat Growth, Battle Abilities, Passive Job Milestones, and JLv.50 Cross-Job Mastery;
- the Jobs tab continues to source its detailed reference from `guide-data.json` rather than expanding hosted player payloads;
- frontend asset revision advances to `1.1.14-continuity3b` while hosted runtime remains `1.1.14-cloud-continuity-h3`.

## Compatibility

- Bot runtime: `1.1.14-cloud-continuity-h3`
- Hosted Web runtime: `1.1.14-cloud-continuity-h3`
- Frontend asset revision: `1.1.14-continuity3b`
- Local DB schema: 4
- Hosted sync schema: 1
- Portal Action protocol: 12
- Twitch prefix: `!`

No Bot code change, database migration, player reset, new Render secret, new OAuth scope, hosted sync schema change, or Portal Action protocol change is introduced by Hotfix 3b.
