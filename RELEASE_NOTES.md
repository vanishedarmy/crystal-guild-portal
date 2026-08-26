# Crystal Guild v1.1.19 — Retro Phase III
## Equipment Artwork Routing Cleanup (iii6)

This checkpoint fixes stale/legacy equipment artwork routing rather than generating another visual set.

Changes:
- Moved the refreshed armor, belt, boots, and ring family art to a new cache-busting Phase III path: `frontend/public/retro-phase-iii/equipment-families-v1/`.
- Updated all 65 live armor entries and all 38 live accessory entries so they resolve to active Phase III artwork or existing Phase III weapon/headgear artwork.
- Removed the retired `retro-phase-ii/accessory-families-v2/` directory.
- Removed the retired `retro-phase-ii/armor-tiers-v2/` directory.
- Removed the obsolete accessory refresh manifests from iii4/iii5.
- Added a routing audit test that rejects any live armor/accessory path still pointing at those retired folders.

Frontend asset revision: `1.1.19-retro-phase-iii6`.

No database, player-data, OAuth, hosted-sync, or Portal Action protocol changes are included.
