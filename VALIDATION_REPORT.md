# Crystal Guild v1.1.15 — Wayfarer Hotfix 2 Validation Report

## Certification summary

**PASS — achievement progression ordering is certified on the v1.1.15 Wayfarer Hotfix 1 baseline.**

Hotfix 2 changes Web presentation/sorting only. Bot runtime, local DB schema **5**, hosted sync schema **1**, and Portal Action protocol **13** remain unchanged.

## Automated validation

- Bot automated tests: **355 / 355 PASS** (unchanged Wayfarer runtime regression)
- Frontend source/unit/regression tests: **163 / 163 PASS**
- Hosted Portal/API tests: **39 / 39 PASS**
- JavaScript/JSX syntax parse: **100 / 100 PASS**
- Python grammar sweep: **73 / 73 PASS**
- Achievement attainment-state ordering contract: **PASS**
- Ascending requirement/tier-chain ordering contract: **PASS**
- Locked/category filter ordering preservation: **PASS**
- Hidden-secret-last ordering contract: **PASS**
- Frontend asset revision contract: `1.1.15-wayfarer1h2` **PASS**
- Exact extracted Hotfix 2 Web frontend tests: **163 / 163 PASS**
- Exact extracted Hotfix 2 hosted Portal/API tests: **39 / 39 PASS**
- Exact extracted Hotfix 2 Complete Bot tests: **355 / 355 PASS**
- Hotfix 1 → Hotfix 2 Web patch overlay: **PASS — finalized Web tree reproduced exactly**
- Full Hotfix 2 Web package comparison: **PASS — finalized Web tree reproduced exactly**
- Complete-package Web subtree comparison: **PASS — finalized Web tree reproduced exactly**
- Complete-package Bot subtree comparison: **PASS — byte-identical to certified Wayfarer Hotfix 1 Bot**

## Hotfix coverage

Validation confirms that:

- earned achievements appear first and are ordered from the smallest requirement upward;
- active, unearned achievements appear next, sorted by highest completion percentage, then least remaining work, then the lower requirement;
- untouched achievements appear after active goals in ascending requirement order;
- concealed Secret achievements are kept at the end of the unearned list rather than being treated as target `0`;
- common milestone chains naturally display in ascending progression such as **10 → 25 → 50**;
- category and Locked/Unlocked filters retain the same progression ordering after filtering;
- cards distinguish **In Progress**, **Not Started**, **Complete**, and **Secret** in the progress row;
- achievement definitions, rewards, AP values, title rewards, unlock conditions, saved progression, and backend snapshot values are unchanged.

## Release identity

- Product: **Crystal Guild v1.1.15 — Wayfarer — Hotfix 2**
- Bot/Web runtime: `1.1.15-wayfarer`
- Frontend asset revision: `1.1.15-wayfarer1h2`
- Local DB schema: **5**
- Hosted sync schema: **1**
- Portal Action protocol: **13**
- Twitch prefix: `!`

No migration, player reset, new Render secret, new OAuth scope, Bot replacement, or Bot restart is required.
