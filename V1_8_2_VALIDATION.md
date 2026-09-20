# Crystal Guild v1.8.2 — Elite Mercs Validation

## Result

**PASS** — the v1.8.2 Elite Mercs release remains compatible after the comprehensive Web UI/UX polish pass.

## Automated validation

| Check | Result |
| --- | --- |
| Bot unit/regression baseline | 748 / 748 passed (Bot unchanged) |
| Hosted Web/API tests | 78 / 78 passed |
| Frontend unit/regression tests | 696 / 696 passed |
| Public image decode audit | 898 / 898 valid |
| Elite Merc artwork set | 18 / 18 present |
| Elite artwork dimensions | 660 × 880 for all 18 cards |
| UI/UX polish regression suite | Passed |

## UI/UX polish coverage

- Cross-panel width containment and natural text wrapping.
- Mobile form legibility and no-zoom sizing.
- Consistent keyboard focus visibility.
- Reduced-motion, higher-contrast, and forced-colors fallbacks.
- Compact status strips and action grouping.
- Responsive Stream battle, Expedition, Dungeon/Solo, recovery-item, and Merc controls.
- Full-frame 3:4 Merc card containment to protect generated borders from cropping.
- Matching Player Guide accessibility/containment refinements.

## Release-contract validation

- Runtime/frontend identity: `1.8.2-elite-mercs`
- Visible release: `v1.8.2 — Elite Mercs`
- Local database schema: 18
- Hosted sync schema: 1
- Portal Action protocol: 35
- No migration or player reset is required.

## Packaging/build note

The Web package is distributed as source, consistent with previous releases. The environment did not have the pinned npm/Vite dependencies available offline, so a local Vite production bundle was not generated. Source-level frontend tests and hosted API tests passed.
