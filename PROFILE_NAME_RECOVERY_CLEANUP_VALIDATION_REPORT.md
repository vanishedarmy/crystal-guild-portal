# Profile Name + Recovery Cleanup Hotfix — Validation Report

Prepared from the validated ii26 Cinzel Typography Pass baseline.

## Layout and UX validation
- Profile display names use an all-width single-line rule with responsive Cinzel sizing and ellipsis fallback.
- Recovery filters to `usable_now && field_usable` before rendering action controls.
- Unavailable and battle-only recovery cards are no longer rendered in the recovery workspace.
- Full Inventory browsing remains intact below Recovery.

## Regression validation
- Frontend unit/regression suite: **250/250 PASS**
- Hosted Web/API tests: **46/46 PASS**

- Production Vite build was not executed in this container because the Vite binary is not installed; source/regression validation completed successfully.

## Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii27`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
