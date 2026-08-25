# Crystal Guild v1.1.18 — Retro Phase 2 Release Notes

Retro Phase 2 is a **Web-focused graphical-content release** built directly on **v1.1.18 — Retro Phase 1 Hotfix 1**. Phase 1 established the shared SNES-era menu/window language; Phase 2 brings character identity, world art, monster imagery, treasure presentation, and selective battle-overlay atmosphere into that foundation without changing authoritative gameplay.

## Character & Job identity

- Guild Heroes cards now display a reusable Job crest beside each hero name.
- The signed-in player profile header uses the same Job identity system, replacing the generic one-symbol profile sigil.
- Job cards use the shared crest system so Warrior, caster, support, field, dark, and arcane identities scan more quickly without adding extra text.
- The system is data-driven and has a neutral fallback, so every current Job remains supported.

## Adventure Board world art

- All eight current regions now display compact illustrated retro scenes inside the existing travel cards:
  - Greenwind Plains
  - Whispering Caverns
  - Sable Coast
  - Magitek Wastes
  - Crystal Expanse
  - Riftlands
  - Interdimensional Rift
  - Omega Ruins
- Locked destinations automatically receive a subdued treatment while their level requirement and travel state remain fully readable.
- Region imagery is lazy-loaded and kept inside fixed aspect-safe windows to prevent layout shift.

## Hunts, Solo Venture & Bestiary

- Hunt cards now include compact illustrated monster tokens without removing reward, weakness, duration, clear-count, or dispatch information.
- Active Solo Venture encounters use the same monster-token language beside the enemy name and level.
- The Bestiary receives a new Retro Field Guide introduction and illustrated tokens on discovered entries.
- Undiscovered Bestiary entries stay visually anonymous; artwork is not used to reveal hidden monster identity.
- Monster tokens are family-aware where possible (beasts, flyers, undead, constructs, dragons/aquatics, volatile creatures, and plant/slime families) with a deterministic fallback for the remaining catalog.

## Treasure & equipment art

- Solo Venture treasure results now display chest artwork according to the reward rarity tier.
- Overview equipment cards receive a compact icon pass for weapon, shield/off-hand, armor, accessory, and footwear-style slots.
- All new interface art is shipped as optimized WebP and uses decorative empty alt text when the adjacent UI already supplies the meaningful label.

## Raid overlay presentation

- The hosted OBS raid overlay now uses the Retro Phase 2 battle-window frame language.
- A restrained battle vignette sits behind the live boss information rather than replacing it.
- Boss name, HP, phase, enrage state, summon gauge, and contribution strip remain the authoritative live information.
- HP movement uses a short stepped retro transition and still disables animation under `prefers-reduced-motion`.

## Player Guide

- Player Guide release identity advances to Retro Phase 2.
- The Guide hero receives a low-opacity world-map atmosphere layer while keeping its existing content and navigation hierarchy intact.

## Major update history & monikers

The Portal's **What's New → Previous major updates** archive now carries the major Crystal Guild lineage instead of only the most recent few builds:

- **v1.0.0 — Ultima Web**
- **v1.0.5 — Ultima**
- **v1.1.0 — Fellowship**
- **v1.1.10 — Chocobo Companions**
- **v1.1.11 — Solo Venture**
- **v1.1.12 — Adventure Board**
- **v1.1.13 — Cloud Runtime**
- **v1.1.14 — Cloud Continuity**
- **v1.1.15 — Wayfarer**
- **v1.1.16 — Arsenal**
- **v1.1.17 — Arsenal II**
- **v1.1.18 — Retro Phase 1**
- **v1.1.18 — Retro Phase 2**

The archive preserves the established names already present in the project history and gives each major milestone a concise player-facing summary.

## Asset/performance discipline

- **27** Phase 2 WebP assets are included.
- Total Phase 2 artwork payload is approximately **427 KiB** before HTTP transfer compression/caching.
- Artwork is sized for its actual UI role rather than shipping the full concept boards to the browser.
- Content images use lazy loading and asynchronous decoding where appropriate.
- The visual layer keeps mobile single-column flow, readable text, full-width actions, focus-visible states, and reduced-motion behavior intact.

## Compatibility

- Hosted Web runtime: `1.1.18-retro-phase-2`
- Frontend asset revision: `1.1.18-retro-phase2`
- Bot runtime: `1.1.17-arsenal-ii-h4` **unchanged**
- Local DB schema: **5** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **14** unchanged
- Twitch command prefix: `!` unchanged

There is **no database migration, player reset, OAuth change, Twitch scope change, new environment variable, or Bot redeploy required**.
