# Crystal Guild v1.6.0 — Gold Saucer Alpha 5 Hotfix 5 — Triple Triad Full Card Face Sync

Hotfix 5 completes the Triple Triad card presentation pass. Owned/player/NPC cards now render the **full 3:4 illustrated card face** instead of a portrait crop with duplicated live values over it. Selection remains visible through the outer highlight only.

## Visual/UI changes
- Publishes a cache-busted `/gold-saucer/a5h5/triple-triad/` family.
- Replaces all 15 card portraits with complete **543×724** card faces.
- Removes visible `triad-card-values`, rarity, name, and shade overlays from full-face cards.
- Keeps Top/Right/Bottom/Left values in accessible labels for screen readers.
- Keeps H4 finger-pointer Gold Saucer collapsibles and render-recovery fallbacks intact.

## Gameplay sync
Because the card art contains printed values, the matching Bot updates Chocobo, Moogle, Cactuar, Bomb, and Flan to those printed numbers. The other ten cards already matched. H5 therefore requires the matching Bot and Web deployment.

Contract: runtime/frontend `1.6.0-gold-saucer-a5h5`, schema **13**, hosted sync **1**, Portal protocol **29**, MGP unchanged.
