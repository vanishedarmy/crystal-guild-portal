# Validation Report — v1.2.0 Expeditions Alpha 2

## Identity
- Hosted Web runtime: `1.2.0-expeditions-alpha2`
- Frontend asset revision: `1.2.0-expeditions-a2`
- Matching Bot runtime: `1.2.0-expeditions-a2`
- Portal Action protocol: **20**
- Hosted sync schema: **1**
- Local Bot DB schema: **8**

## Automated validation
- Frontend Node regression suite: **299 / 299 passed**.
- Hosted Portal Python suite: **47 / 47 passed**.
- Alpha 2 coverage verifies Region Progress presentation, Regional Boss Contract launch controls, Mastery copy, and hosted validation of the `boss` Expedition depth.
- Alpha 1 Hotfix 3 Board artwork and prior regional-art/collapse/readability regressions remain covered.

## Production bundle note
- The Vite production bundle was not executed in this environment because package dependencies / the local `vite` binary are not installed. Source regression and hosted API suites are fully passing.
