# Crystal Guild v1.9.4.7 — Retainer Service Redesign

This hotfix redesigns the existing Retainer Service without changing Retainer backend rules, protocol, rewards, timers, rank progression, or procurement balance.

## UI changes
- Consolidates the Retainer profile, current assignment, and lifetime record into one compact status command panel.
- Replaces the large assignment-card wall with a two-pane Procurement Board:
  - compact assignment list for fast scanning;
  - selected-assignment detail panel for artwork, duration, rank requirement, EXP, Gil cost, likely finds, priority selection, and dispatch.
- Keeps locked assignments visible with clear rank requirements.
- Keeps current-assignment timer, secured-haul messaging, collection controls, and anti-reroll explanation intact.
- Makes Recent Retainer Hauls collapsible so history no longer dominates the page.
- Retains action-first mobile navigation and adds responsive layouts for the new command panel and procurement board.

## Artwork
Adds:
- `frontend/public/retainer/a2h1/assignments/specialist-acquisition-v2.webp`

The new Specialist Acquisition art is 724 × 543 WebP and follows the established Crystal Guild / SNES-FF Retainer assignment style. The source now points Specialist Acquisition to the new `-v2` filename so clients do not reuse a cached copy of the previous art.

## Changed files
- `frontend/src/player/RetainerService.jsx`
- `frontend/src/styles/portal.css`
- `frontend/public/retainer/a2h1/assignments/specialist-acquisition-v2.webp`

## Deployment
This is a frontend source change and requires the normal Vite production build. Docker deployments using the included `Dockerfile` will rebuild the frontend during deployment.

No Bot/database/schema/protocol changes are required.

## Validation
- Retainer backend tests: passed (`tests.test_retainer_alpha1`, `tests.test_retainer_alpha2`).
- `RetainerService.jsx`: TypeScript parser validation passed with JSX preservation.
- Legacy frontend Retainer tests that check current behavior/layout hooks pass; several old metadata assertions elsewhere in the baseline test suite remain stale against the already-current v1.9.4.7 package.
- A local Vite production bundle was not generated in this workspace because the package registry was unavailable while installing Vite dependencies. The supplied full/merge packages retain the project's normal build-on-deploy workflow.
