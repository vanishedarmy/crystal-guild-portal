# Crystal Guild v1.1.17 — Arsenal II Hotfix 5 Validation Report

## Automated validation

- Frontend Node tests: **190 / 190 PASS**
- Hosted Portal/API tests: **46 / 46 PASS**
- Frontend production build: **NOT RUN in the clean archive workspace** (the release archive intentionally excludes `node_modules`; dependency installation was not completed in the isolated packaging environment)
- Hosted Web Python compile sweep: **PASS**

## Hotfix 5 targeted coverage

PASS — a signed-in player’s linked character is promoted to the first Guild Heroes card position regardless of character level.

PASS — all remaining characters are ordered by character level descending.

PASS — equal-level characters use display name as a stable alphabetical tie-breaker.

PASS — linked-character matching is case-insensitive.

PASS — filtered search results preserve the same own-character-first / level-descending ordering without forcing the player card into unrelated searches.

PASS — directory ordering returns a copied array and does not mutate the Portal API snapshot.

## Compatibility

- Bot runtime: `1.1.17-arsenal-ii-h4`
- Hosted Web runtime: `1.1.17-arsenal-ii-h4`
- Frontend asset revision: `1.1.17-arsenal-ii1h5`
- Local DB schema: **5**
- Hosted sync schema: **1**
- Portal Action protocol: **14**
- Twitch prefix: `!`

No database migration, player reset, OAuth change, new environment variable, or Bot redeploy is required.
