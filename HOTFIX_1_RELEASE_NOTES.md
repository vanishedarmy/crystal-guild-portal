# Crystal Guild v1.1.17 — Arsenal II Hotfix 1

This is a Web-only presentation/cache hotfix for the Player Guide build badge.

## Fixed

- The Player Guide masthead no longer shows the stale **Cloud Continuity** codename next to the current v1.1.17 version.
- The badge now renders **v1.1.17 / Arsenal II**.
- The guide badge codename is now populated from the centralized Web release identity instead of remaining as an old hard-coded string, preventing this specific stale-codename regression in future releases.
- Frontend asset revision is bumped to `1.1.17-arsenal-ii1h1` so the corrected guide markup/runtime is cache-busted on deployment.

## Compatibility

- Bot runtime: `1.1.17-arsenal-ii` unchanged
- Hosted Web runtime: `1.1.17-arsenal-ii` unchanged
- Frontend asset revision: `1.1.17-arsenal-ii1h1`
- Local DB schema: 5 unchanged
- Hosted sync schema: 1 unchanged
- Portal Action protocol: 14 unchanged
- No database migration, player reset, OAuth change, or new environment variable is required.
