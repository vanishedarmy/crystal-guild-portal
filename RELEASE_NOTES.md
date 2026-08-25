# Crystal Guild v1.1.18 — Retro Phase II
## Monster Identity Pass — Wave 5

This Web-only graphical pass expands the shared Bestiary/Hunt monster-art system from forty to fifty illustrated monsters and carries the same artwork through the Player Guide via the authoritative shared portrait lookup.

### Wave 5 monsters
- Magic Pot
- Malboro
- Sea Serpent
- The Riven Ronin
- Adamantoise
- Magitek Drone
- Ahriman
- Garuda
- Malboro Overlord
- Death Claw

Waves 1–4 remain included in the new cache-busted `monster-portraits-v5` asset library.

### Image handling
- Wave 5 source artwork uses a 3:4 composition and is proportionally fitted inside the established 512×768 WebP portrait canvas with transparent padding.
- Bestiary, Hunts, and Player Guide continue using `object-fit: contain`, preventing artwork from being stretched, squashed, or cover-cropped.
- The full Web package removes the superseded v4 portrait directory; the Wave 5 patch leaves previously deployed v4 files harmlessly unused.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii9`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
