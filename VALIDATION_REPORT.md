# Crystal Guild v1.3.0 — Guild Expansion Alpha 5 Hotfix 1 Validation Report

## Result
**PASS**

## Regression suites
- Compatible Alpha 5 Bot unittest suite: **470 / 470 PASS**.
- Frontend Node regression suite: **346 / 346 PASS**.
- Hosted Web/API unittest suite: **47 / 47 PASS**.
- New Founding Hall / inventory-collapse regression coverage: **3 / 3 PASS** (included in the frontend total).

The Bot regression log includes the existing intentional simulated outage/recovery, acknowledgement-loss, and Twitch availability warnings from resilience tests; those scenarios pass and are not hotfix failures.

## Founding Hall visual verification
- New `founding_hall.png` is packaged at **941×1672** in `/retro-phase-iii/scene-backgrounds-v4/`.
- `SCENE_BACKGROUND_MANIFEST.json` records the image as a portrait scene for **Fellowship — Guild Legacy — Founding Hall**.
- The scene is bound specifically to `.fellowship-legacy.legacy-stage-1` and fills the entire Legacy panel with `cover` / top-centered portrait treatment.
- Readability gradients and stronger translucent card backing remain above the art.
- `prefers-contrast: more` adds a substantially darker readability layer.
- Later Legacy stages are not forced to reuse the Founding Hall art.

## Equipment & Inventory verification
- Weapons, Armor, Accessories, Consumables, and Materials each expose an independent collapse toggle.
- Toggle state uses accessible `aria-expanded` / `aria-controls` relationships and native buttons.
- Group controls retain a **44px** minimum touch target and visible keyboard focus treatment.
- Group open/closed state is persisted in browser local storage and restored on reload.
- Default behavior remains open when no preference has been stored.
- The former generic `Items` inventory heading is now player-facing **Consumables**.

## Source and asset validation
- Python compile sweep: **86 / 86 PASS** across Web + compatible Bot source.
- Web JavaScript/MJS `node --check`: **142 / 142 PASS**.
- Frontend JS/JSX TypeScript-parser syntax sweep: **65 / 65 PASS**.
- Explicit quoted static/artwork route audit: **222 unique routes checked, 0 missing**.
- Founding Hall PNG dimensions: **941×1672**.

## Compatibility
- Hosted Web runtime: `1.3.0-guild-expansion-a5` unchanged
- Frontend asset revision: `1.3.0-guild-expansion-a5h1`
- Compatible Bot runtime: `1.3.0-guild-expansion-a5` unchanged
- Local DB schema: **9** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **21** unchanged
- Twitch prefix: `!`
- Database migration: **none**
- Player reset: **none**
- OAuth change: **none**
- New environment variables: **none**

## Packaging verification
- Alpha 5 → Alpha 5 Hotfix 1 Web patch: **36 changed/new files, 0 deletions**; reconstructs the **802-file** final Web tree exactly.
- Full Web archive vs finalized Web tree: **802 / 802 files exact**.
- Complete archive Web subtree vs finalized Web tree: **802 / 802 files exact**.
- Complete archive compatible Bot subtree vs Alpha 5 Bot tree: **141 / 141 files exact**.
- ZIP CRC/integrity: **3 / 3 PASS**.
- Runtime/private-artifact hygiene: **0 violations** across all three archives.
- SHA-256 manifest verification: **PASS** for all release archives and release documents.
