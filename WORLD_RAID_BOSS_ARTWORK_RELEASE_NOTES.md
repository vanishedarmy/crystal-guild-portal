# Crystal Guild v1.1.18 — Retro Phase II
## World / Raid Boss Artwork Pass

This Web-only build completes a dedicated 16:9 artwork pass for all 37 canonical World Bosses, Primals, High Bosses, Superbosses, and Ultimate Superbosses.

### Artwork coverage
- 37/37 canonical raid bosses illustrated.
- Every raid artwork asset is normalized to 1280×720 (16:9) WebP for consistent Web presentation.
- Artwork is available in the Player Guide boss catalog and boss dossier modal.
- Player Records and Trophy Hall boss victory cards now surface the same shared artwork.
- Boss detail dialogs use the shared raid artwork.
- The OBS raid overlay now uses the active boss artwork as a subdued background while preserving status readability.

### Compatibility
- Canonical boss roster and gameplay data are unchanged.
- No Bot runtime change, DB migration, OAuth change, environment-variable change, or player reset is required.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii20`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
