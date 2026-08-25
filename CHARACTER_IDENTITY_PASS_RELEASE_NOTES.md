# Crystal Guild v1.1.18 — Retro Phase II: Character Identity Pass

This Web-only visual pass builds on the Retro Phase II Region Cache Fix and introduces production Job portrait integration without changing gameplay, database, sync, or Portal Action behavior.

## Character portrait system
- Adds 10 standalone 3:4 WebP Job portraits under `/retro-phase-ii/job-portraits-v2/`.
- Illustrated mappings: Black Mage, White Mage, Red Mage, Paladin, Dark Knight, Dragoon, Monk, Thief/Rogue, Ranger, and Summoner.
- Unsupported Jobs use a readable framed fallback instead of a missing/broken image.
- Portrait assets are loaded lazily except for the active profile masthead portrait.

## Interface integration
- Guild Heroes cards now use a portrait-first identity layout while preserving own-character-first and level ordering.
- Character profile mastheads show the active Job portrait beside identity and vitals.
- Jobs cards use portraits for both public viewing and character management.
- Solo Venture combat shows the player's current Job portrait beside combat vitals.

## Anti-clipping / responsive rules
- Portrait frames use a fixed `3 / 4` aspect ratio.
- Artwork uses `object-fit: contain`; it is never stretched or cropped.
- Text columns use `min-width: 0` plus controlled wrapping so names, handles, Job names, and titles cannot squeeze the art.
- Desktop/tablet/mobile/narrow-phone breakpoints collapse layout columns before artwork dimensions are compromised.
- At very narrow widths portraits move above text instead of being compressed.

## Compatibility
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii4`
- Bot runtime: unchanged `1.1.17-arsenal-ii-h4`
- Local DB schema: 5 unchanged
- Hosted sync schema: 1 unchanged
- Portal Action protocol: 14 unchanged
- Twitch prefix: `!` unchanged

No migration, player reset, OAuth change, environment variable, or Bot redeploy is required.
