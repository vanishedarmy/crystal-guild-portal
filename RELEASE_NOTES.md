# Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 5

## Unified PC/Mobile UI/UX + SNES FF Pass

This Web-focused pass audits the entire Crystal Guild Portal and resolves accumulated responsive overrides through one final shared visual system.

### Layout and control consistency

- Shared desktop/mobile spacing, panel, card, control, and touch-target scales now apply across the Portal.
- Buttons use predictable placement and sizing; heading actions remain compact while primary card actions become full-width on phones where appropriate.
- Dense desktop grids retain useful multi-column layouts but collapse before cards become tall/narrow on mobile.
- Tab and filter groups become horizontal touch rails when wrapping would create large button walls.
- Tables and dialogs are viewport-safe instead of forcing page-level overflow.

### Image and content containment

- Job portraits preserve their native 3:4 composition without crop/stretch across desktop, tablet, phone, and short landscape layouts.
- Retainer, Raid, Dungeon, Expedition, Hunt, and scenic artwork is bounded so images cannot push essential content or controls out of place.
- Mobile scenic artwork is visually subordinate to interactive content.

### SNES / FF visual language

- Primary Portal windows use a unified dark-blue Final Fantasy-inspired double-edge treatment with crisp square geometry and pixel-like shadows.
- Nested cards use a consistent secondary window language instead of mixed glass/rounded treatments.
- Control geometry and spacing are tightened while preserving current typography, pointer hands, pixel assets, and SNES/FF6 artwork.
- The Player Guide receives the same window/control treatment and responsive density rules.

### Compatibility

The Gear Favorites Authority Fix remains intact: Favorites stay in authoritative player state under schema **16** / Portal protocol **33**. Treasure Seekers Solo progress, Rally 100% Encounter / 0% Treasure, Solo 80% / 20%, Weapon + Armor Best use, mobile Guide/Retainer improvements, ☆/★ controls, level-descending equipment sorting, and removal of `Replaces X` remain unchanged.

Runtime/frontend remains `1.7.1-resynthesis-a2h5`; hosted sync remains **1**. This UI pass requires no database migration and no player reset.
