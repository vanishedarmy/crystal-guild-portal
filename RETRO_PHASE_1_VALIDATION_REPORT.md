# Crystal Guild v1.1.18 — Retro Phase 1 Validation Report

## Automated validation

- Frontend Node tests: **194 / 194 PASS**
- Hosted Portal/API tests: **46 / 46 PASS**
- Bot regression suite: **378 / 378 PASS**
- Hosted Web Python compile sweep: **PASS**
- Bot tree comparison against v1.1.17 Arsenal II Hotfix 5: **0 differences**
- Frontend production build: **NOT RUN in the clean archive workspace** because the release archive intentionally excludes `node_modules` and Vite is therefore not installed in the isolated package tree.

## Retro Phase 1 targeted coverage

PASS — the Retro stylesheet is imported after the Portal and Streamer styles so it functions as an isolated presentation layer.

PASS — shared panels, cards, tables, navigation, controls, dialogs, and Streamer Dashboard surfaces receive the new crisp menu-window framing.

PASS — the Player Guide receives a matching independent Retro Phase 1 stylesheet layer.

PASS — active navigation has a visible retro menu-selection cue while keyboard focus uses a high-contrast focus ring.

PASS — mobile retains the shared compact header structure and receives simplified framing at narrow widths.

PASS — reduced-motion handling remains present.

PASS — Hotfix 5 Guild Heroes ordering behavior remains covered: signed-in hero first, then remaining heroes by level descending.

## Compatibility

- Bot runtime: `1.1.17-arsenal-ii-h4`
- Hosted Web runtime: `1.1.18-retro-phase-1`
- Frontend asset revision: `1.1.18-retro-phase1`
- Local DB schema: **5**
- Hosted sync schema: **1**
- Portal Action protocol: **14**
- Twitch prefix: `!`

No database migration, player reset, OAuth change, new environment variable, or Bot redeploy is required.

## Final archive verification

- Full Web archive vs finalized Web tree: **0 differences**
- Complete archive vs finalized complete tree: **0 differences**
- Hotfix 5 Web + Retro Phase 1 Web patch vs finalized Web tree: **0 differences**
- Hotfix 5 Complete + direct Retro Phase 1 update vs finalized complete tree: **0 differences**
- Standalone SHA-256 manifest verification: **all delivered files PASS**
