# Crystal Guild v1.9.91 — Equipment Expansion

## Integrations
- 173 newly illustrated endgame equipment pieces, with per-item WebP artwork (119 ordinary, 54 Ultimate Relic forms).
- Uses revised Batch 06 armour and the individually revised Batch 08 Zephyr signets, never their rejected flat placeholders.
- ItemArtwork and the public Player Guide resolve the same exact item IDs in `/equipment-expansion-1991/`.
- Relic Arsenal displays the correct per-stage Ultimate Relic image (Awakening, Transcendence, Eternal).
- Player Guide restored as deployable HTML/CSS/JSON and catalog updated from Bot 1.9.10 authoritative data (618 total items, 36 Relic lines).
- Player Guide covers gear tiers, shop/crafting, Twitch chat gear commands, and Ultimate progression.

## Installation
Merge `Web/` over the existing deployed Web directory (keep old public assets). Merge `Bot/` over the existing Bot directory if desired for matching release/version files. Preserve `.env`, live database, and configuration. Web includes new WebP art but intentionally does NOT replace older unrelated artwork; don't delete the existing `Web/frontend/public` artwork tree. Rebuild and redeploy Web after merging.

## Known limitations
- Recovered guide shell CSS/markup comes from the latest available full v1.9.7 Web baseline, while live catalog data has been refreshed from v1.9.10 Bot files. Verify other historical guide copy against current gameplay.
- Production/browser testing and third-party deployment are not performed by packaging the source.
- Image files were generated in previous artwork batches and may warrant final art-director visual QA.
