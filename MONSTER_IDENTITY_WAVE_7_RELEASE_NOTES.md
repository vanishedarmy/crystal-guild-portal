# Crystal Guild v1.1.18 — Retro Phase II
## Monster Identity Pass — Wave 7

This Web-only graphical pass expands the shared Bestiary/Hunt monster-art system from sixty to seventy illustrated monsters. Wave 7 also retains the Solo Venture enemy portrait integration introduced in Wave 6, so any illustrated encounter automatically displays the same authoritative portrait used by Bestiary, Hunts, and Player Guide.

### Wave 7 monsters
- Crystal Wolf
- Mover
- Tonberry Executioner
- Tonberry King
- Crystal Golem
- Red Dragon
- Blue Dragon
- Elemental Archon
- Magitek Juggernaut
- Gold Dragon

Waves 1–6 remain included in the new cache-busted `monster-portraits-v7` asset library.

### Image handling
- Wave 7 source artwork is proportionally fitted inside the established 512×768 WebP portrait canvas.
- Bestiary, Hunts, Player Guide, and Solo Venture continue using contain-fit rendering so artwork is not stretched, squashed, or cover-cropped.
- The full Web package removes the superseded v6 portrait directory; the Wave 7 patch leaves previously deployed v6 files harmlessly unused.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii11`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
