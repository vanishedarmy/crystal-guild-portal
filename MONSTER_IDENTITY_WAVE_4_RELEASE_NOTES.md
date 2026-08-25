# Crystal Guild v1.1.18 — Retro Phase II
## Monster Identity Pass — Wave 4

This Web-only graphical pass expands the shared Bestiary/Hunt monster-art system from thirty to forty illustrated monsters and carries the same artwork through the Player Guide via the authoritative shared portrait lookup.

### Wave 4 monsters
- Mindflayer
- Zu
- Antlion
- Piscodemon
- Black Flan
- Coeurl
- Sand Worm
- Chimera
- Remora
- King Coeurl

Waves 1–3 remain included in the new cache-busted `monster-portraits-v4` asset library.

### Image handling
- Wave 4 source artwork is 3:4; export preserves that composition without stretching by fitting it proportionally inside the established 512×768 portrait canvas.
- Bestiary, Hunts, and Player Guide continue using `object-fit: contain` so artwork is not cropped or squashed.
- Superseded v2/v3 monster portrait directories are removed from the full Web package; the Wave 4 patch leaves older deployed files harmlessly unused.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii9`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
