# Crystal Guild v1.1.18 — Retro Phase II

## Character Identity Pass

Retro Phase II now includes production Job portrait integration across Guild Heroes, character profiles, Jobs, and Solo Venture. Portraits preserve a 3:4 frame with no cropping or stretching and fall back cleanly for Jobs that do not yet have illustrated artwork. Frontend asset revision: `1.1.18-retro-phase-ii3`.

Retro Phase II is a **fresh Web-only production-art rebuild** based directly on **v1.1.18 — Retro Phase 1 Hotfix 1**. The rejected Phase 2 concept-board visual package is not part of this release.

## Purpose-built region artwork

Retro Phase II begins the production-art rollout with eight standalone original region scenes made for the real Adventure Board and Player Guide card dimensions:

- Greenwind Plains
- Whispering Caverns
- Sable Coast
- Magitek Wastes
- Crystal Expanse
- Riftlands
- Interdimensional Rift
- Omega Ruins

Each asset is a 640×360 WebP scene with a shared late-16-bit JRPG visual language. The scenes are tied to the authoritative live region IDs instead of hard-coded concept names.

## Adventure Board integration

- Region artwork now sits inside the existing region cards without replacing level requirements, descriptions, status badges, or travel controls.
- Locked regions automatically dim their scene while the actual gameplay information remains readable.
- Current-region framing receives a subtle distinct state without adding more UI noise.
- Art uses pixel-preserving rendering and a fixed 16:9 crop so desktop and mobile cards stay predictable.
- The existing bottom-anchored Travel button rhythm remains intact.

## Player Guide integration

The same region scenes appear in the Player Guide's region reference cards, giving each destination one consistent visual identity across the site. No unrelated art is injected into other Guide sections.

## Major update archive

What's New now records the major Crystal Guild release lineage and monikers:

- v1.0.0 — Ultima Web
- v1.0.5 — Ultima
- v1.1.0 — Fellowship
- v1.1.10 — Chocobo Companions
- v1.1.11 — Solo Venture
- v1.1.12 — Adventure Board
- v1.1.13 — Cloud Runtime
- v1.1.14 — Cloud Continuity
- v1.1.15 — Wayfarer
- v1.1.16 — Arsenal
- v1.1.17 — Arsenal II
- v1.1.18 — Retro Phase 1
- v1.1.18 — Retro Phase II

## Compatibility

- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii3`
- Compatible Bot runtime: `1.1.17-arsenal-ii-h4` unchanged
- Local DB schema: **5** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **14** unchanged
- Twitch command prefix: `!` unchanged

No database migration, player reset, OAuth change, new environment variable, or Bot redeploy is required.