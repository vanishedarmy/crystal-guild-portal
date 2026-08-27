# Crystal Guild v1.1.19 — Retro Phase III Chocobo Portraits (iii13)

This paired Bot + Web checkpoint adds persistent, player-selectable Chocobo portraits while preserving the Retro Phase III artwork and Facility Supply Balance changes from iii12.

## Chocobo portrait feature
- Registered Chocobos now have a persistent `portrait_id` stored by the authoritative Bot.
- The Chocobo Stable includes a portrait gallery with **10 SNES/FF-style head-and-bust portraits**.
- Players can preview any portrait and use **Apply Portrait** to save it to their registered companion.
- The selected portrait appears on the owner’s Stable card and on the read-only Chocobo card when another adventurer views that profile.
- Portrait selection is cosmetic only and does not change Bond, traits, stats, Expeditions, or combat.
- Existing registered Chocobos are migrated safely to **Classic Gold** as the default portrait.

## Portrait catalog
Classic Gold · Midnight · Celestial · Ember · Verdant · Cobalt · Arcane · Sandrunner · Frost · Rose.

Assets live under:
`frontend/public/retro-phase-iii/chocobo-portraits-v1/`

## Technical changes
- Bot runtime: `1.1.19-retro-phase-iii-chocobo1`
- Hosted Web runtime: `1.1.19-retro-phase-iii-chocobo1`
- Frontend asset revision: `1.1.19-retro-phase-iii13`
- Local DB schema: **6** (`player_chocobos.portrait_id`)
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **15** (`SET_CHOCOBO_PORTRAIT`)
- Twitch command prefix: `!` unchanged

No player reset, OAuth change, or new environment variable is required.
