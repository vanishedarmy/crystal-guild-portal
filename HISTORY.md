# v1.2.0 — Expeditions Beta 2 Hotfix 1
Web-only current-viewport dialog positioning fix. Hosted runtime remains `1.2.0-expeditions-beta2`; frontend revision advances to `1.2.0-expeditions-b2h1`; compatible Bot remains `1.2.0-expeditions-b1`; protocol 20 and DB schema 8 unchanged.

# v1.2.0 — Expeditions Beta 2
Web-only UX consolidation: viewport-preserving detail/disclosure behavior, action-first Adventure Board hierarchy, and independently collapsible Expedition Atlas detail. Hosted runtime `1.2.0-expeditions-beta2`; frontend revision `1.2.0-expeditions-b2`; compatible Bot remains `1.2.0-expeditions-b1`; protocol 20 and DB schema 8 unchanged.

# v1.2.0 — Expeditions Beta 1
Balance/simulation feature freeze: Safe and Push Deeper now change actual combat/hazard pressure, Legendary final-boss scaling is slightly smoothed, a fixed-seed 3,000-run balance matrix is published, and Alpha 5 Hunt Seal stipends remain unchanged. Hosted runtime `1.2.0-expeditions-beta1`; frontend revision `1.2.0-expeditions-b1`; protocol 20 and DB schema 8 unchanged.

# v1.2.0 — Expeditions Alpha 2 Hotfix 2

- Adds a dedicated Player Guide Expeditions chapter covering regions, route depths, persistent travel, Cache/rescue, exploration milestones, Regional Boss Contracts, and Mastery.
- Updates Chocobo Guide copy for active v1.2 Expedition usage.
- Frontend asset revision `1.2.0-expeditions-a2h2`; no Bot/schema/protocol change.

# v1.2.0 — Expeditions Alpha 2 Hotfix 1

- Daily Guild Provisions now appears before What's New on Adventurer Overview.
- What's New summarizes Alpha 2 and is collapsible with a remembered browser preference.
- Distant Expedition Board is collapsible with the same remembered preference behavior.
- Frontend asset revision advances to `1.2.0-expeditions-a2h1`; protocol/schema remain unchanged.

# v1.2.0 — Expeditions Alpha 2
Adds five regional objective chains, 25/50/75/100% exploration milestone presentation, Regional Boss Contracts, persistent boss-clear/Mastery status, five Mastery achievements/titles, rare late-region encounters, and LIVE-only notable Portal Expedition announcements. Hosted runtime `1.2.0-expeditions-alpha2`; frontend revision `1.2.0-expeditions-a2`; protocol 20 and DB schema 8 unchanged.

# v1.2.0 — Expeditions Alpha 1 Hotfix 3
Web-only Expedition Board artwork visibility fix. Resets the inherited shared-panel 1px pseudo-element height so the map-room backdrop fills the full Distant Expedition Board, with a lighter readability gradient. Frontend asset revision `1.2.0-expeditions-a1h3`; protocol 20 and DB schema 8 unchanged.

# v1.2.0 — Expeditions Alpha 1 Hotfix 2
Web-only Expedition presentation pass: six new Expedition backdrops, collapsible Travel Regions/Hunt Board, and a concise player-copy cleanup. Frontend asset revision `1.2.0-expeditions-a1h2`; protocol 20 and DB schema 8 unchanged.

# v1.2.0 — Expeditions Alpha 1
Adds the five-region Expedition Adventure Board, Chocobo trait integration, Scout/Journey/Deep routes, authoritative persistent stage timers, Expedition combat/choices/camp/cache/return/rescue, regional exploration progress, persistent result cards, and matching protocol 20 Portal actions. Paired Bot local DB schema advances 7 → 8.

# RC1 Hotfix 9 — Raid Timing & Field Support
Paired Web/Bot timing and support pass: Raid 90s rally / 60s rounds, Rally Venture 60s rally / 30s rounds, Bot-synchronized Portal clocks, LIVE Portal raid-rally chat announcements, immediate overlay clear on inactive victory/wipe state, and LIVE out-of-battle field-item support targeting. Protocol 19; DB schema 7 unchanged.

# RC1 Hotfix 8 — Raid Overlay Visual Rework
Web-only hosted OBS overlay redesign with dedicated boss-art framing, Final Fantasy-inspired HUD treatment, HP percentage/critical styling, Summon meter, damage-leader chips, and distinct ENRAGED/VICTORY/WIPE states. Portal Action protocol remains 18 and the RC1H7 Bot remains compatible. Frontend revision `1.1.19-retro-phase-iii14-rc1h8`.

# RC1 Hotfix 7 — Streamer Inventory Admin
Adds broadcaster-only player inventory administration to the Streamer Control Center plus matching owner-only `!additem` / `!removeitem` chat commands. The Portal operation is strict, owner-verified, ledgered, and replay-safe. Local DB schema remains 7; Portal Action protocol advances 17 → 18. Frontend revision `1.1.19-retro-phase-iii14-rc1h8`.

# RC1 Hotfix 6 — Persistent Adventure Results
Adds a durable per-player Adventure Board result inbox for Portal Solo Venture and Portal-origin timed Hunt outcomes. Results survive page changes, browser refreshes, time away, and Bot restarts; each remains visible until explicitly confirmed through the new typed `ACK_ADVENTURE_RESULT` action. Advances local DB schema 6 → 7 and Portal Action protocol 16 → 17. Frontend revision `1.1.19-retro-phase-iii14-rc1h6`.

# RC1 Hotfix 5 — Streamer Control Center + Live Portal Announcements
Redesigns `/streamer` around normal responsive document flow, adds authenticated typed Streamer Control actions, advances Portal Action protocol to 16, and enables live-only notable Portal Solo/Hunt/Title Twitch announcements. Frontend revision `1.1.19-retro-phase-iii14-rc1h5`; DB schema 6 and hosted sync schema 1 unchanged.

# RC1 Hotfix 4 — Relic Refresh + Dynamic Camp
Regenerates all 24 Relic weapon stage visuals and updates Camp to a 15-minute LIVE / 1-hour OFFLINE base timer in the paired authoritative Bot runtime. Frontend revision `1.1.19-retro-phase-iii14-rc1h4`; hosted sync schema and Portal Action protocol remain unchanged.

# v1.1.19 Retro Phase III RC1 Hotfix 3 — Relic Visuals

Relic artwork integration pass. Adds 24 stage-aware Relic weapon PNG routes, builds them into the Portal Relic Arsenal, Relic details, Trophy Hall, Player Guide Relic catalog/dossiers, and shared item artwork. Frontend revision `1.1.19-retro-phase-iii14-rc1h4`. No gameplay/schema/protocol changes.

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

## v1.2.0 Expeditions Alpha 2 Hotfix 3
- Added Solo Venture scenic backdrop.
- Added Relics Arsenal scenic backdrop.
- Updated web asset revision to 1.2.0-expeditions-a2h3.

