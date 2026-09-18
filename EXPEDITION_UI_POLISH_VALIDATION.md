# Crystal Guild v1.8.0 Final — Expedition UI Polish Validation

## Validation completed

- Expedition-focused frontend regression set: **42/42 PASS**.
- New Expedition UI polish tests plus battle-item classification tests: **9/9 PASS**.
- Full frontend Node suite: **659/660 PASS**.
- The single full-suite failure is an existing stale assertion in `assetOptimization131.test.mjs` that still expects `Web/crystal_guild/__init__.py` to report `1.7.0`; the shipping Final baseline already reports `1.8.0-merc-final` and the failing test is unrelated to this Expedition UI patch.
- CSS brace-balance sanity check: **PASS**.
- Expedition JSX brace/parenthesis balance sanity check: **PASS**.

## Scope confirmation

- Frontend-only UI/UX changes.
- No Expedition reward, encounter, travel-time, combat, item-effect, or route-balance changes.
- No backend, database, schema, hosted-sync, or Portal-action changes.
- Runtime identity remains `1.8.0-merc-final`.

## Build environment note

The shipping source archive does not include `node_modules`, so the Vite production bundle command is not available in this workspace. Validation therefore uses the source/regression suite and static source checks, consistent with the Final release package's documented build-environment limitation.
