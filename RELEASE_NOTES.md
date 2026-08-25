# Crystal Guild v1.1.18 — Retro Phase II
## Monster Identity Pass — Wave 2

This Web-only graphical pass expands the shared monster-art system to twenty illustrated Bestiary/Hunt monsters and repairs Player Guide portrait resolution so the Guide uses the same authoritative Job/monster lookup logic as the Portal.

### Wave 2 monsters
- Cockatrice
- Cave Bat
- Queen Hornet
- Ochu
- Skeleton
- Cactuar
- Ossuary Knight
- Spriggan
- Basilisk
- Crimson Detonator

Wave 1 remains included: Goblin, Wolf, Mandragora, Goblin Chieftain, Goblin Guard, Hornet, Flan, Imp, Dire Wolf Alpha, and Bomb.

### Player Guide image fixes
- Guide Job cards now use `jobPortraitPath()` rather than constructing file names from raw Job IDs.
- This repairs Black Mage, White Mage, Red Mage, Dark Knight, Blue Mage, and Time Mage, whose compact data IDs did not match their underscore-based image filenames.
- Guide Bestiary and Hunt art now use the same `monsterPortraitPath()` lookup as the Portal.
- The Guide, Bestiary, and Hunts retain `object-fit: contain`, preserving artwork without cropping or squashing.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii6`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
