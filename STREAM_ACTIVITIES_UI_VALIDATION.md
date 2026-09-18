# Crystal Guild v1.8.0 Final — Stream Activities UI Validation

## Validation completed

- Stream/Adventure/navigation/version-label focused frontend regression set: **71/71 PASS**.
- Full frontend Node regression suite: **664/665 PASS**.
- The only full-suite failure is the same pre-existing stale assertion in `assetOptimization131.test.mjs` that expects `Web/crystal_guild/__init__.py` to report `1.7.0`; the shipping Final runtime correctly reports `1.8.0-merc-final`.
- Hosted Web/API Python suite: **78/78 PASS**.
- Bot Python suite: **733/733 PASS**.
- Stream Venture scenic asset routing test: **PASS**.
- Live-board visible-version-label regression: **PASS**.
- Adventure Board no longer renders Stream Venture or Raid UI: **PASS**.
- Stream Activities owns Stream Venture and Raid presentation: **PASS**.

## Scope confirmation

- Frontend/navigation/player-guide refinement only.
- Stream Venture and Raid participation remain Twitch-first.
- No new Portal mutation actions were introduced.
- No gameplay, economy, encounter, reward, cooldown, database, schema, hosted-sync, or protocol changes.
- Runtime identity remains `1.8.0-merc-final`.

## Build environment note

The shipping source archive does not include `node_modules`, so the Vite production bundle command is not available in this workspace. Validation uses the complete source/regression suites and static source checks, consistent with the existing v1.8 Final package validation process.
