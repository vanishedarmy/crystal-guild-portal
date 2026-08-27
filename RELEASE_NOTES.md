# Crystal Guild v1.1.19 — Retro Phase III Item & Weapon Refresh (iii11)

This checkpoint replaces 33 inventory assets with regenerated transparent PNG artwork and reorganizes the production files by asset type.

## Typed production libraries
- Consumables: `frontend/public/retro-phase-iii/item-icons-v1/`
- Weapons: `frontend/public/retro-phase-iii/weapon-icons-v2/`
- Equipment families: `frontend/public/retro-phase-iii/equipment-families-v1/` (PNG-only)

The new library paths are intentionally cache-busted so browsers/CDNs cannot continue serving superseded artwork from the previous URLs.

## Refreshed assets
- 3 consumables: Phoenix Down, Antidote, Tent
- 30 weapons from Batches 1–4

All 33 refreshed files are normalized to 512×512 transparent PNGs. Old `item-icons-v4`, `weapon-icons-v1`, and equipment-family WEBP duplicates are not retained in the production build.

Frontend asset revision: `1.1.19-retro-phase-iii11`.
