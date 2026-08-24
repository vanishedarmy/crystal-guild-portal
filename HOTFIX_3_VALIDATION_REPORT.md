# Crystal Guild v1.1.17 — Arsenal II Hotfix 3 Validation Report

## Scope

Hotfix 3 changes only hosted Web presentation rules for Adventure Board region/Hunt card continuity and bumps the frontend asset revision. No gameplay mutation, schema, protocol, OAuth, or Bot runtime behavior changes.

## Targeted continuity checks

PASS — region grids stretch cards into consistent rows on desktop/tablet.

PASS — every region Travel control is full width and uses the same 56px desktop/tablet action height, including labels that wrap.

PASS — region action controls stay bottom anchored regardless of description length.

PASS — helper text beneath region controls has a consistent spacing slot.

PASS — narrow/mobile region grids return to natural row sizing with full-width 52px controls.

PASS — Hunt action footers are bottom anchored for consistent card rhythm.

## Automated validation

- Bot tests: **377 / 377 PASS** (unchanged Bot source)
- Frontend Node tests: **184 / 184 PASS**
- Hosted Portal/API tests: **46 / 46 PASS**
- Hosted Python compile sweep: **PASS**

## Compatibility

- Bot runtime: `1.1.17-arsenal-ii`
- Hosted Web runtime: `1.1.17-arsenal-ii`
- Frontend asset revision: `1.1.17-arsenal-ii1h3`
- Local DB schema: **5**
- Hosted sync schema: **1**
- Portal Action protocol: **14**

No database migration, player reset, OAuth change, new environment variable, or Bot redeploy is required.
