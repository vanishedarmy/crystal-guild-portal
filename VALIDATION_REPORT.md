# Crystal Guild v1.1.15 — Wayfarer Hotfix 1 Validation Report

## Certification summary

**PASS — the reusable player-facing What's New Overview panel is certified on the v1.1.15 Wayfarer baseline.**

Hotfix 1 changes Web presentation only. Bot runtime, local DB schema **5**, hosted sync schema **1**, and Portal Action protocol **13** remain unchanged.

## Automated validation

- Bot automated tests: **355 / 355 PASS** (unchanged runtime regression)
- Frontend source/unit/regression tests: **161 / 161 PASS**
- Hosted Portal/API tests: **39 / 39 PASS**
- JavaScript/JSX syntax parse: **100 / 100 PASS**
- Python grammar sweep: **73 / 73 PASS**
- Player-facing What's New contract: **PASS**
- Mobile What's New responsive contract: **PASS**
- Frontend asset revision contract: `1.1.15-wayfarer1h1` **PASS**
- Exact extracted Hotfix 1 Web frontend tests: **161 / 161 PASS**
- Exact extracted Hotfix 1 hosted Portal/API tests: **39 / 39 PASS**
- Exact extracted Hotfix 1 Complete Bot tests: **355 / 355 PASS**
- Wayfarer → Hotfix 1 Web patch overlay: **PASS — finalized Web tree reproduced exactly**
- Complete-package Bot subtree comparison: **PASS — byte-identical to certified Wayfarer Bot**

## Hotfix coverage

Validation confirms that:

- Overview renders a dedicated **What's New** panel immediately after the Adventurer Home summary;
- the featured Wayfarer entry explains interactive Solo Venture using player-facing wording only;
- the notice covers turn choices, Press On/Return, persistent resources, 60/40 Encounter/Treasure odds, and the no-timer behavior;
- **Go to Adventure Board** uses the existing profile navigation path rather than opening a duplicate page;
- major-update content lives in a reusable update list so later releases can be added without redesigning the Overview;
- previous update history is supported automatically when more than one major update is present;
- mobile layouts collapse to one readable column and the primary action expands to full width;
- no schema, protocol, Bot gameplay, reward, cooldown, or persistence behavior changed.

## Release identity

- Product: **Crystal Guild v1.1.15 — Wayfarer — Hotfix 1**
- Bot/Web runtime: `1.1.15-wayfarer`
- Frontend asset revision: `1.1.15-wayfarer1h1`
- Local DB schema: **5**
- Hosted sync schema: **1**
- Portal Action protocol: **13**
- Twitch prefix: `!`

No migration, player reset, new Render secret, new OAuth scope, or Bot replacement is required.
