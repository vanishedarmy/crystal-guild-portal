# Validation Report — v1.2.0 Expeditions Alpha 2 Hotfix 1

## Identity
- Hosted Web runtime: `1.2.0-expeditions-alpha2`
- Frontend asset revision: `1.2.0-expeditions-a2h1`
- Matching Bot runtime: `1.2.0-expeditions-a2`
- Portal Action protocol: **20**
- Hosted sync schema: **1**
- Local Bot DB schema: **8**

## Automated validation
- Frontend Node regression suite: **301 / 301 passed**.
- Hosted Portal Python suite: **47 / 47 passed**.
- Python compilation: **PASS**.
- New coverage verifies Daily Provisions appears before What's New, Alpha 2 What's New copy, remembered collapsible What's New state, and remembered collapsible Expedition Board state.
- Existing Region Progress, Regional Boss Contract, Mastery, artwork, Travel Regions, Hunt Board, and responsive presentation regressions remain passing.

## Production bundle note
- The Vite production bundle was not executed because frontend dependencies / the local `vite` binary are not installed in this environment. Source regressions and hosted API suites are fully passing.
