# Crystal Guild v1.1.18 — Retro Phase II
## Monster Identity Pass — Wave 6

This Web-only graphical pass expands the shared Bestiary/Hunt monster-art system from fifty to sixty illustrated monsters and now surfaces the same shared monster portrait directly inside Solo Venture combat whenever an illustrated enemy is encountered.

### Wave 6 monsters
- Iron Giant
- Iron Giant Exile
- Ironclad
- Behemoth
- Chimera Brain
- Evil Eye
- Great Malboro
- Three Moon Chimera
- Death Machine
- Magitek Armor

Waves 1–5 remain included in the new cache-busted `monster-portraits-v6` asset library.

### Solo Venture presentation update
- Solo Venture combat now shows the active enemy portrait beside the enemy stat block.
- Existing illustrated monsters, including earlier entries like Basilisk, now display their art during Solo Venture battles automatically through the shared lookup.
- Bestiary, Hunts, Player Guide, and Solo Venture continue sharing a single authoritative monster portrait map.

### Image handling
- Wave 6 source artwork is proportionally fitted inside the established 512×768 WebP portrait canvas with transparent padding.
- Bestiary, Hunts, Player Guide, and Solo Venture continue using contain-fit presentation so artwork is not stretched or cropped.
- The full Web package removes the superseded v5 portrait directory; the Wave 6 patch leaves previously deployed v5 files harmlessly unused.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii10`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
