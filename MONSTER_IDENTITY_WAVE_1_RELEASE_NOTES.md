# Crystal Guild v1.1.18 — Retro Phase II
## Monster Identity Pass — Wave 1

This Web-only visual pass adds the first ten production monster portraits and uses one shared monster-art system across the Bestiary, Hunts, and Player Guide.

### Wave 1 monsters
- Goblin
- Wolf
- Mandragora
- Goblin Chieftain
- Goblin Guard
- Hornet
- Flan
- Imp
- Dire Wolf Alpha
- Bomb

### Interface integration
- Bestiary rows now show discovered monster portraits with neutral fallbacks for entries that do not yet have artwork.
- Hunt Board cards, active Hunts, and Hunt results reuse the same authoritative monster portrait mapping.
- Player Guide Bestiary and Hunt sections reuse the same monster art library.
- Player Guide Jobs cards now reuse the existing `job-portraits-v2` library so the recently created player/job artwork is visible in the Guide too.
- Monster and Job art use fixed aspect-ratio containers with `object-fit: contain`; the layouts collapse before images are compressed or cropped.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii7`
- Bot runtime: unchanged
- DB schema: unchanged
- Hosted sync schema: unchanged
- Portal Action protocol: unchanged
