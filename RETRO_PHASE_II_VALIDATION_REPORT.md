# Crystal Guild v1.1.18 — Retro Phase II Validation Report

## Automated validation

- Frontend Node tests: **199 / 199 PASS**
- Hosted Portal/API tests: **46 / 46 PASS**
- Unchanged Bot regression suite: **378 / 378 PASS**
- Bot source tree vs Retro Phase 1 Hotfix 1 baseline: **0 differences**
- Frontend production Vite build: **NOT RUN in the clean release workspace** because the source archive intentionally does not include `node_modules`; `vite` is therefore unavailable without dependency installation.

## Retro Phase II targeted coverage

PASS — the Retro Phase II stylesheet loads after the Retro Phase 1 foundation.

PASS — all eight live region IDs have independent `.webp` production assets.

PASS — every region asset is exactly **640×360 (16:9)** and all eight files have unique SHA-256 hashes.

PASS — combined region-art payload is **46,446 bytes** before HTTP compression/caching.

PASS — Adventure Board cards resolve artwork from each live `region.id`; no rejected concept-board names are used by the runtime integration.

PASS — Player Guide region cards resolve the same live region artwork.

PASS — locked-state visual rules dim artwork without removing level/status/travel information.

PASS — What's New includes the major release lineage and monikers from Ultima Web through Retro Phase II.

## Compatibility

- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii2`
- Bot runtime: `1.1.17-arsenal-ii-h4` unchanged
- Local DB schema: **5**
- Hosted sync schema: **1**
- Portal Action protocol: **14**
- Twitch command prefix: `!`

No database migration, reset, OAuth change, new environment variable, or Bot redeploy is required.

## Final archive verification

- Full Web archive vs finalized Web tree: **0 differences**
- Complete archive vs finalized complete tree: **0 differences**
- Web patch over Retro Phase 1 Hotfix 1 vs finalized Web tree: **0 differences**
- Direct update over Retro Phase 1 Hotfix 1 Complete vs finalized complete tree: **0 differences**
