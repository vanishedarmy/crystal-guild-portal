# Forge Gear Priority Hotfix — Validation Report

## Behavior
- Currently equipped forgeable equipment is grouped first.
- Non-equipped forged gear (`+1` and above) is grouped second and sorted by equipment level.
- Non-equipped unforged gear (`+0`) is grouped third and sorted by equipment level.
- Equipment level is visible on each Forge Gear card.
- Search results retain the same priority grouping and sorting.

## Regression
- Frontend tests: **253/253 PASS**
- Hosted Web/API tests: **46/46 PASS**

Frontend asset revision: `1.1.18-retro-phase-ii29`.
