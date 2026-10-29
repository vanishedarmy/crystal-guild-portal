# Crystal Guild Web 1.9.4.7 — Gold Saucer Layout Hotfix

This hotfix corrects a CSS cascade issue introduced by the v1.9.4.7 portal usability pass.

## Fixed

- Crystal Slots no longer receives vertical panel-stack spacing while it is a side-by-side child of the Gold Saucer game grid.
- Mini Cactpot and Crystal Slots now start on the same horizontal line and end on the same horizontal line at desktop widths.
- The same containment reset is applied to other explicit panel grid containers used by the usability pass so grid children do not inherit vertical-stack spacing.
- No Gold Saucer game logic, MGP values, payouts, timers, or Bot behavior changed.

## Validation

Gold Saucer Alpha 1/2/4/5 regression tests: 9 passed.

## Deployment

If using the FULL DEPLOY ROOT package, upload/deploy it exactly as the Web service root. The Dockerfile remains at archive root and rebuilds the Vite frontend during Docker deployment.

If using the small merge hotfix, merge its `Web/` folder into the current Crystal Guild project and redeploy/rebuild the Web service.
