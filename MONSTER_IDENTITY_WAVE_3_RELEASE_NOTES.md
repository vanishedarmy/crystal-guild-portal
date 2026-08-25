# Crystal Guild v1.1.18 — Retro Phase II
## Monster Identity Pass — Wave 3

This Web-only graphical pass expands the shared monster-art system to thirty illustrated Bestiary/Hunt monsters and runs another Player Guide image validation pass so recent Job artwork and monster portraits resolve cleanly from the same authoritative lookup utilities.

### Wave 3 monsters
- Gigas
- Lamia
- Mimic
- Gargoyle
- Sahagin
- Sahagin Prince
- Tonberry
- Killer Fish
- Cactuar Jack
- Gigantoad

Waves 1 and 2 remain included, bringing the illustrated Bestiary/Hunt roster to thirty total monsters through level 18 content.

### Player Guide image validation
- Monster portrait lookup now points to the cache-busted `/retro-phase-ii/monster-portraits-v3/` asset path.
- The Guide continues using the shared `jobPortraitPath()` and `monsterPortraitPath()` utilities used by the Portal.
- Wave 3 adds an automated asset check to confirm all mapped Player Guide Job portraits exist in `job-portraits-v2`.
- Bestiary, Hunt, and Guide portrait presentation remains `object-fit: contain` to avoid cropping or squashing.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii7`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
