# Crystal Guild v1.1.19 Retro Phase III RC1 Hotfix 3 — Relic Visuals

## Summary
This web-only visual hotfix builds the three-stage Relic weapon artwork into the live Portal and Player Guide while preserving gameplay, progression, databases, and Portal Action behavior.

## Relic artwork
- Adds a dedicated `relic-weapons-v1` artwork family for all eight Relic questlines: Gae Bolg, Excalibur, Apocalypse, Godhand, Masamune, Stardust Rod, Nirvana, and Last Knife.
- Every Relic now has explicit Dormant, Awakened, and Zenith artwork routing (24 PNG assets total).
- Awakened visuals use the completed Batch 2 weapon artwork.
- Zenith visuals use the completed Batch 3 final-form artwork.
- Dormant visuals retain restrained canonical weapon art so each progression path has a complete visual ladder without changing item identity.

## Where Relic visuals now appear
- Adventurer Portal Relic Arsenal cards, using the hero's current Relic stage.
- Relic detail dialog.
- Trophy Hall completed Relics and featured Relic trophies, fixed to Zenith artwork.
- Player Guide Relic catalog cards, previewing the Zenith final form.
- Player Guide Relic dossiers, showing the correct artwork beside every Dormant / Awakened / Zenith stage reward.
- Shared item artwork routing, so Relic reward weapons display their dedicated art anywhere the standard item artwork component is used.

## UI treatment
Relic images use `object-fit: contain`, transparent PNG backgrounds, compact framed presentation, and responsive sizing so long weapons remain visible without cropping on desktop or mobile.

## Compatibility
- Web-only hotfix.
- Runtime identity remains `1.1.19-retro-phase-iii-rc1`.
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1h3`.
- Local DB schema: unchanged.
- Hosted sync schema: unchanged.
- Portal Action protocol: unchanged.
- Twitch command prefix: `!` unchanged.
- No database migration, player reset, OAuth reauthorization, or new environment variables required.
