# Crystal Guild v1.9.4.7 — Chocobo Stable Readability Rework

## Baseline
Built on the current Crystal Guild v1.9.4.7 web baseline after the Retainer Service redesign and Overview readability rework.

## Goal
The Chocobo Stable had grown into several equally prominent blocks: companion profile, Expedition preparation, specialization, records, portrait management, registration steps, a second Expedition explainer, and long supporting copy. The feature logic was sound, but the page did not have a clear visual priority.

This pass keeps the existing Chocobo systems intact and reorganizes them around the companion first, immediate readiness second, and optional management last.

## Registered Chocobo layout
- Replaced the old split companion + preparation layout with one **Companion Command** section.
- Companion portrait, name, level, Bond progress, total Bond XP, and persistent trait now read as one identity block.
- Added a compact quick-stat strip for Specialty, Expeditions, Rare Finds, and Boss Clears.
- Consolidated Expedition information into a single **Expedition Readiness** card; the duplicate bottom Expedition explainer was removed.
- Reworked Bond specialization into a cleaner **Bond Specialty** card with effect chips and only the secondary records that are not already shown above.
- Moved rename and portrait controls into **Companion Management**, collapsed by default so cosmetic/service controls do not dominate the Stable page.
- The 10 existing Chocobo portraits and all portrait behavior remain unchanged.
- Removed the permanent "Stable connection ready" block. Offline/action messages now appear as a compact status strip only when useful.

## Chocobo registration layout
Before a Chocobo is registered, the old 2×2 wall of four full cards is replaced with a guided registration flow:

1. Build Stable
2. Personal Quest
3. Registration Writ
4. Register Chocobo

A compact four-step progress strip shows the complete journey, while the main panel displays only the **current actionable step**. A small roadmap on the side keeps prior/future steps visible without repeating all of their explanatory copy.

The original Stable unlock, quest requirements, 500-Gil/default Writ handling, exact one-hour Writ timer, registration name validation, and backend Portal Actions are unchanged.

## Responsive behavior
- Desktop: companion identity + quick stats share the primary command panel; readiness and specialization form a two-column second row.
- Tablet: command and dashboard sections stack cleanly while quick stats remain compact.
- Mobile: companion portrait/identity, management controls, registration roadmap, and all action controls collapse to a single readable flow with full-width action buttons where appropriate.

## Files changed
- `frontend/src/player/ChocoboStable.jsx`
- `frontend/src/styles/portal.css`
- `frontend/tests/portalChocobo.test.mjs`
- `frontend/tests/expeditionComingSoon.test.mjs`
- `frontend/tests/chocoboStableRework1947.test.mjs` (new)
- `frontend/tests/alpha3UiCompactnessHotfix4.test.mjs` (legacy Chocobo layout assertion updated)

## Validation
Passed:
- JSX parser validation via TypeScript JSX parser
- CSS parser validation via PostCSS
- `portalChocobo.test.mjs`
- `expeditionComingSoon.test.mjs`
- `chocoboStableRework1947.test.mjs`

Combined Chocobo/Expedition validation: **11/11 passing**.

## Scope
No Bot, database, schema, Portal Action protocol, economy, Chocobo balance, Bond XP rates, Expedition rewards, portrait assets, or Fellowship construction requirements were changed.

## Deployment
This is a frontend source change and requires the normal Vite build during deployment. The full deploy package retains the project's normal build-on-deploy structure.
