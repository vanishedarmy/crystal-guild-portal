# Crystal Guild v1.8.2 — UI/UX Polish Validation

## Result

**PASS** — the refreshed v1.8.2 Web tree passed the UI/UX regression and hosted API suites.

## Automated validation

| Check | Result |
| --- | --- |
| Frontend unit/regression tests | **696 / 696 passed** |
| Hosted Web/API tests | **78 / 78 passed** |
| Public image decode audit | **898 / 898 valid** |
| Existing v1.8.2 Bot baseline | **748 / 748 passed; Bot unchanged in this pass** |
| Public PNG routing regression | Covered by frontend suite |
| UI containment / wrapping regression | Covered by new v1.8.2 polish tests |
| Focus / reduced-motion / contrast regression | Covered by new v1.8.2 polish tests |
| Merc 3:4 artwork containment | Covered by new v1.8.2 polish tests |
| Mobile recovery two-column layout | Covered by existing + new frontend tests |

## Build validation note

A local Vite production bundle was not generated because the validation environment does not contain the pinned npm packages and the missing `@vitejs/plugin-react` package is not available in the offline npm cache. The release continues to ship the source Web project with pinned dependencies in `frontend/package.json`, matching the established Crystal Guild deployment workflow.

## Release contract

- Visible release: `v1.8.2 — Elite Mercs`
- Runtime/frontend identity: `1.8.2-elite-mercs`
- Local schema: **18**
- Hosted sync: **1**
- Portal Action protocol: **35**
- No migration or reset required.
