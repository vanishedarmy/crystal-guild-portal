# Crystal Guild v1.1.16 — Arsenal Hotfix 5 Release Notes

Arsenal Hotfix 5 fixes a hosted Portal acknowledgement regression that could leave the Bot action worker repeatedly logging:

`HTTP 400: {"error":"Request payload size is invalid."}`

## Root cause

Hotfix 3 correctly increased the maximum authoritative Portal action result to 64 KiB so the expanded Arsenal Adventure Board could return stocked Solo Venture/Hunt data. However, the HTTP handler for `/api/actions/result` still read the entire authenticated Bot result POST through the older 16 KiB request ceiling.

A result could therefore be valid according to `complete_action()` but be rejected before it reached that validation layer. The worker's generic poll loop then reported the failed acknowledgement as a Portal action poll error.

## Fix

- `/api/actions/claim` remains limited by the normal 16 KiB action-request ceiling.
- Browser-submitted Portal action payloads remain limited to 16 KiB.
- `/api/actions/result` now has a separate bounded HTTP-envelope allowance of 68 KiB.
- The actual stored action result is still independently capped at 64 KiB.
- Existing forbidden-field/privacy validation remains unchanged.
- Portal Action protocol remains 14.

This directly allows the Bot to acknowledge legitimate Arsenal Adventure Board results above 16 KiB without weakening normal player/browser request limits.

## Compatibility

Bot runtime remains `1.1.16-arsenal-h4`.
Hosted Web runtime advances to `1.1.16-arsenal-h5`.
Frontend asset revision advances to `1.1.16-arsenal1h5`.
Local DB schema remains 5; hosted sync schema remains 1; Portal Action protocol remains 14.

No migration, Bot replacement, player reset, OAuth change, or new Render secret is required.
