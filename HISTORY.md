# v1.1.19 Retro Phase III RC1 Hotfix 3 — Relic Visuals

Relic artwork integration pass. Adds 24 stage-aware Relic weapon PNG routes, builds them into the Portal Relic Arsenal, Relic details, Trophy Hall, Player Guide Relic catalog/dossiers, and shared item artwork. Frontend revision `1.1.19-retro-phase-iii14-rc1h3`. No gameplay/schema/protocol changes.

# v1.1.19 Retro Phase III RC1 Hotfix 2 — Chocobo Portrait Refresh

Replaced the ten Chocobo portrait assets with the regenerated transparent PNG bust set and compacted portrait selection into a less obtrusive toggleable gallery. Existing portrait IDs and selection behavior remain compatible.

# v1.1.19 — Retro Phase III / Release Candidate 1

Finalization checkpoint: four scenic Portal backgrounds, final artwork-path and progression audits, Chocobo portrait continuity, facility-material balance continuity, and release-tree cleanup. Runtime `1.1.19-retro-phase-iii-rc1`; frontend `1.1.19-retro-phase-iii14-rc1`.

# History

## v1.1.19 — Retro Phase III Chocobo Portraits (iii13)
- Added 10 SNES/FF-style Chocobo bust portraits to the Stable.
- Added persistent player portrait selection through the authoritative Bot.
- Public/read-only Chocobo cards now display the owner-selected portrait.
- Advanced local DB schema 5 → 6 and Portal Action protocol 14 → 15 without resetting progression.

## v1.1.19 — Retro Phase III Facility Supply Balance (iii12)
- Rebalanced all six recurring Fellowship facility materials across multiple level-appropriate monster sources.
- Added early practical sources at Lv.11 or below while preserving stronger late-game farming targets.
- Updated Player Guide Bestiary drop data to match the paired authoritative Bot tables.
- Preserved existing facility/project progress with no schema or protocol migration.

## v1.1.19 — Retro Phase III (iii8)
- Completed current material artwork coverage at 84/84.
- Added the final 19 material identities and expanded material-icons-v1 to 39 transparent PNGs.
- Cleared the prior R02/R04 QA hold with corrected artwork while keeping rejected generations out of production routing.

## v1.1.19 — Retro Phase III iii6
- Fixed stale equipment artwork routing.
- Moved refreshed armor/accessory family art to a cache-busting Retro Phase III path.
- Removed retired Phase II armor/accessory family directories.
- Added live catalog routing validation for all armor and accessories.

## v1.1.19 — Retro Phase III, asset refresh 3
- Rebuilt the shared weapon-family fallbacks as transparent PNG assets.
- Corrected fallback paths to the Retro Phase III library.
- Removed obsolete Phase II weapon-family and weapon-tier fallback WebPs.
- Retained the 180 named CG-GEAR-R01 through R18 artwork files.

## v1.1.19 — Retro Phase III, asset refresh 2
- Added and packaged CG-GEAR-R14 through CG-GEAR-R18.
- Consolidated the Retro Phase III named gear icon set to 180 PNG assets.

## v1.1.19 — Retro Phase III iii5
- Refreshed accessory-family boots t1–t6 and rings t1–t6.
- Replaced legacy files in place while preserving production URLs.

## v1.1.19 — Retro Phase III (iii7)
- Added 20 verified material sprites from CG-MAT-R01 and CG-MAT-R03.
- Added a Phase III material asset path and live routing for those identities.
- Increased material artwork coverage from 45/84 to 65/84.
- Added QA gating so mismatched CG-MAT-R02/R04 output is not silently routed to incorrect item identities.

## v1.1.19 — Retro Phase III RC1 Hotfix 1
- Fixed RC1 scenic backgrounds that were collapsed to the shared panel 1px pseudo-element.
- Camp, Blacksmith, Chocobo Stable, and Moogle Emporium now use independent cache-busted `scene-backgrounds-v2` scene layers.
- Frontend revision: `1.1.19-retro-phase-iii14-rc1h1`.
