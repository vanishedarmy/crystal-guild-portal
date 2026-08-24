# Crystal Guild v1.1.16 — Arsenal Hotfix 5 Upgrade Guide

Upgrade baseline: **v1.1.16 — Arsenal Hotfix 4**.

## Upgrade

1. Replace/overlay the Hotfix 5 Web files onto the current Hotfix 4 Web repository.
2. Push the Web files to GitHub and redeploy Render.
3. Leave the Bot installation unchanged; Bot runtime `1.1.16-arsenal-h4` is the matching runtime for this Web hotfix.
4. After Render reports the deployment live, refresh the Portal once.
5. Verify `/api/health` reports hosted runtime `1.1.16-arsenal-h5` and frontend revision `1.1.16-arsenal1h5`.
6. Watch the worker log: the repeated `Request payload size is invalid.` acknowledgement/poll error should stop on the next successful action cycle.

There is no schema migration and no Portal Action protocol change.

If a stuck adventure remains from the prior failed acknowledgements, the Hotfix 4 streamer recovery command `!clearadventures` remains available and unchanged.
