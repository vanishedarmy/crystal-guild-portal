# Validation Report — RC1 Hotfix 6 Persistent Adventure Results

## Identity
- Web runtime: `1.1.19-retro-phase-iii-rc1h6`
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1h6`
- Paired Bot runtime: `1.1.19-retro-phase-iii-rc1h6`
- Hosted sync schema: 1
- Portal Action protocol: 17 on both sides
- Paired local DB schema: 7

## Automated validation
- Frontend Node tests: **291 / 291 PASS**
- Hosted Web / Portal Python tests: **47 / 47 PASS**
- Paired Bot Python tests: **400 / 400 PASS**
- Python `compileall` for Web and Bot runtime modules: **PASS**

## Hotfix 6 coverage
- `ACK_ADVENTURE_RESULT` is strictly typed and validated by the hosted Web.
- The authoritative Bot verifies result ownership before acknowledging a row.
- Solo Venture result cards persist after transient in-memory state is cleared.
- Timed Hunt results persist regardless of whether the Hunt was accepted in chat or the Portal.
- Pending result cards have no time-based expiry and are returned newest-first.
- Confirming one result clears only that result and returns refreshed Adventure Board state.
- Portal action replay protection covers result confirmation.
- Existing Streamer Control Center and LIVE-only notable Portal announcements remain covered by prior regression tests.
- Dynamic Camp remains 15-minute LIVE / 1-hour OFFLINE base timing.
- Relic Tier 1/2/3 artwork routing remains covered by the existing Relic visual suite.

## Build note
The source package does not vendor `frontend/node_modules`, so a local Vite production compile was not run in this container. The Render/Docker deployment path continues to install pinned frontend dependencies and execute the production Vite build during deployment. All source-level frontend tests pass.
