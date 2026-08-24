# Crystal Guild v1.1.17 — Arsenal II Hotfix 5 Release Notes

Hotfix 5 is a **Web-only Guild Heroes ordering fix** built on Arsenal II Hotfix 4.

## Guild Heroes directory

- The signed-in player’s linked Crystal Guild character is always pinned to the **first profile-card position** whenever that character is present in the displayed roster.
- Every other visible character remains sorted by **character level from highest to lowest**.
- Heroes tied at the same level use display name as the stable alphabetical tie-breaker.
- The rule is case-insensitive against the linked Twitch/Crystal Guild username.
- Search still behaves as a filter: the player’s own card is pinned first only when it is part of the current filtered results.
- The sort operates on a copied array and does not mutate the authoritative Portal snapshot.

## Compatibility

- Bot runtime: `1.1.17-arsenal-ii-h4` unchanged
- Hosted Web runtime: `1.1.17-arsenal-ii-h4` unchanged
- Frontend asset revision: `1.1.17-arsenal-ii1h5`
- Local DB schema: **5** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **14** unchanged
- Twitch command prefix: `!` unchanged

No database migration, player reset, OAuth change, new environment variable, or Bot redeploy is required.
