## v1.5.1 — Relic Arsenal Complete
- Completes Relic coverage for all 18 playable Jobs with 10 new three-stage questlines and 30 stage weapon items.
- Adds matching Relic artwork and 18-Job collection progress in the Portal and Player Guide.
- Keeps the Active Hunt scenic layer visible through Hunt resolution/result confirmation.
- Runtime `1.5.1-relic-arsenal-complete`; schema 10 / hosted sync 1 / Portal protocol 25 unchanged.

## v1.5.0 — Trails & Raids
- Promotes the validated RC1 feature set into the final production release.
- Adds production scenic backgrounds for Active Hunt and the collapsed/open Trial & Raid Board.
- Keeps Trial content, rewards, economy, combat, progression, schema 10, hosted sync 1, Portal protocol 25, OAuth, and environment requirements unchanged from RC1.

## v1.5.0 — Trails & Raids RC1
- Freezes the seven-Trial feature set and reward/economy model for release-candidate validation.
- Readiness counts and all-actions-ready checks now use the same exact Raid run + upcoming-round ownership rule as round resolution.
- Malformed/stale action stamps fail closed and fall back to the normal automatic Attack instead of breaking resolution or falsely showing ready.
- Preserves one-time compatibility for an unstamped queued action restored from pre-Beta-3 state.
- Refreshes current release/deployment metadata and the Bot control-panel identity; runtime `1.5.0-trails-raids-rc1`, schema 10 / hosted sync 1 / Portal protocol 25 unchanged.

## v1.5.0 — Trails & Raids Beta 3
- Adds Round Readiness and richer Last Trial Result contributor details.
- Carries the seven frozen Trials, Chronicle, repeat mastery, and Beta 2 settlement hardening forward.
- Matching Bot hardens multi-connection active-Raid round state without a schema/protocol change.

## v1.5.0 — Trails & Raids Beta 2
- Adds repeat-clear mastery, Last Trial Result, live action-readiness presentation, and settlement-hardening continuity.
- Keeps the seven-Trial catalog, roomy collapsible Board, Trial Chronicle, rewards, schema 10, sync 1, and Portal protocol 25 unchanged.
- Runtime/frontend/Bot `1.5.0-trails-raids-b2`.

## v1.5.0 — Trails & Raids Beta 1
- Freezes the seven scripted Trials and adds the authenticated Trial Chronicle across the Trial Board and Records page.
- Existing clears carry forward; Beta 1 begins persistence of wipes, fastest clears, and contribution personal bests.
- Runtime/frontend/Bot `1.5.0-trails-raids-b1`; schema 10 / sync 1 / Portal protocol 25 unchanged.

## v1.5.0 — Trails & Raids Alpha 7
- Bahamut — The Final Coil becomes the first capstone Trial.
- Flare Breath, Akh Morn, Megaflare Towers, and critical-HP Teraflare Charge add multi-phase coordination.
- The Trial Board gives Bahamut a full-width capstone card while preserving the roomy collapsible layout.
- Runtime `1.5.0-trails-raids-a7`; schema 10 / hosted sync 1 / Portal protocol 25 unchanged.

## v1.5.0 — Trails & Raids Alpha 6
Adds Leviathan — Tidebreak Expanse as the sixth scripted Trial. Tidal Sweep marks one side of the raid for individual Defend responses, Undertow adds HP/resource pressure, and Maelstrom Surge introduces a two-round Stability Gauge whose coordinated Defends determine Tidal Wave strength. Alpha 5's roomier collapsible Trial Board remains the presentation baseline. Runtime/frontend `1.5.0-trails-raids-a6`; schema 10 / sync 1 / Portal protocol 25 unchanged.

# Crystal Guild Release History

## v1.5.0 — Trails & Raids Alpha 5
Adds Garuda — Eye of the Storm as the fifth scripted Trial. Slipstream and Friction introduce targeted Defend responses with different party consequences, while Satin/Razor Plumes create a two-round add pressure phase that determines Aerial Blast strength. The collapsible Trial & Raid Board receives a spacious two-column desktop redesign with wider copy, separated metadata/stats/commands, and single-column responsive fallbacks. Runtime/frontend `1.5.0-trails-raids-a5`; schema 10 / sync 1 / Portal protocol 25 unchanged.

# Crystal Guild Web History

## v1.5.0 — Trails & Raids Alpha 4
Adds Titan — Heart of the Crag as the fourth scripted Trial. Landslide introduces a Defend-driven brace response, Granite Gaol temporarily restrains one raider until the party breaks the prison, and the exposed Heart creates a two-round damage check that weakens or empowers Earthen Fury. The collapsible Trial & Raid Board remains intact and gains Titan rescue/Heart telegraphs. Runtime/frontend `1.5.0-trails-raids-a4`; schema 10 / sync 1 / Portal protocol 25 unchanged.

## v1.5.0 — Trails & Raids Alpha 3
Adds Ramuh — Judgment Spire with chain lightning, shared-hit stack coordination, and a Defend-driven Grounding Gauge. The Adventure Board Trial & Raid Board becomes collapsible using the established right/down disclosure pointer language. Runtime `1.5.0-trails-raids-a3`; schema 10, hosted sync 1, and Portal protocol 25 unchanged.

## v1.5.0 — Trails & Raids Alpha 2
- Shiva — Diamond Throne: Frostbrand Cleave, Icebound Mirrors, Diamond Aegis, Stagger, Diamond Dust.
- Adds and Break/Stagger public state, role-aware contribution display, no schema/protocol change.
- Runtime/frontend/Bot `1.5.0-trails-raids-a2`.

## v1.5.0 — Trails & Raids Alpha 1 Hotfix 2
- Web-only Player Guide completeness and visual-cleanup pass.
- Gives The Riftglass Observatory a dedicated Dungeons & Delves guide dossier with its full ten-chamber/Event/miniboss/finale identity.
- Removes the old gold divider from Portal and Player Guide CSS and deletes the asset from the shipping tree.
- Hosted runtime remains `1.5.0-trails-raids-a1h1`; frontend advances to `1.5.0-trails-raids-a1h2`; Bot remains `1.5.0-trails-raids-a1`; schema 10 / sync 1 / protocol 25 unchanged.

## v1.5.0 — Trails & Raids Alpha 1 Hotfix 1
- Web-only hosted Overlay compatibility repair.
- Accepts Alpha 1 sanitized Trial fields: encounter type/name, mechanic/last mechanic, next-round time, mitigation, and weighted contribution score.
- Fixes Portal sync HTTP 400 errors such as `Overlay snapshot contains unsupported field: last_mechanic`.
- Hosted runtime `1.5.0-trails-raids-a1h1`; frontend/Bot remain `1.5.0-trails-raids-a1`; schema 10 / sync 1 / protocol 25 unchanged.

## v1.5.0 — Trails & Raids Alpha 1
- Begins the cooperative Raid/Trial expansion with Ifrit — Inferno Crucible.
- Adds telegraphed targeted/raidwide mechanics, Infernal Nails damage check, Hellfire resolution, weighted contribution, and live Raid Board/overlay presentation.
- Runtime `1.5.0-trails-raids-a1`; schema 10 / sync 1 / protocol 25 unchanged.

## v1.4.0 — Dungeons & Delves
- Final production release of the feature-frozen RC1 Dungeon system.
- Ships the four-delves catalog and preserves Beta 2 mobile/UX consolidation plus Beta 3/RC1 shared-state, replay, restart, and packaging hardening.
- Final Web/frontend runtime is `1.4.0-dungeons-delves`; schema 10 / sync 1 / Portal protocol 25 remain unchanged.
- Public What's New now presents Dungeons & Delves as a shipped stable release; prerelease milestones remain engineering history only.

## v1.4.0 — Dungeons & Delves RC1
- Release-candidate cleanup and deployment-readiness pass with the four-Dungeon catalog frozen.
- Keeps Beta 2 UX/mobile consolidation and Beta 3 shared-state/replay/restart hardening unchanged.
- Advances Bot/Web/frontend identity to `1.4.0-dungeons-rc1` while keeping schema 10 / sync 1 / protocol 25.
- Refreshes Player Guide/current-build wording and repeats package/upgrade/asset-route validation.

## v1.4.0 — Dungeons & Delves Beta 2
- Web-only Dungeon UX/mobile consolidation on the feature-frozen Beta 1 ruleset.
- Clarifies active-run progress, carried Cache risk, Crossroads consequences, settlement outcomes, and personal Dungeon records.
- Tightens Dungeon cards, results, battle controls, and route-choice layouts for narrow/mobile screens.
- Keeps compatible Bot `1.4.0-dungeons-b1`, schema 10 / sync 1 / Portal protocol 25 unchanged.

## v1.4.0 — Dungeons & Delves Beta 1
- Freezes the four-Dungeon catalog for stabilization and release-quality testing.
- Adds persisted revision binding to every Dungeon Portal mutation, closing same-room stale tabs.
- Keeps schema 10 / sync 1 unchanged; Portal Action protocol advances 24 → 25.
- Adds Round X / Limit encounter clarity and maintains the 16 KiB Adventure-state guardrail.

## v1.4.0 — Dungeons & Delves Alpha 4
- Adds The Riftglass Observatory (Lv.34 + 55% The Astral Scar), the fourth persistent Dungeon.
- Adds weighted Dungeon Event chambers and room-specific encounter rules/opening pressure.
- Expands room outcomes with cache/resource/future-room effects while preserving restart-safe run state.
- Keeps schema 10 / sync 1 / Portal protocol 24 unchanged and preserves the 16 KiB Adventure-state guardrail.

## v1.4.0 — Dungeons & Delves Alpha 3
Adds The Whiteglass Bastion, forward Crossroads effects that can shape later hazards/combat, and one-time first-clear Dungeon rewards. Runtime/frontend advance to `1.4.0-dungeons-a3`; schema 10 / sync 1 / Portal protocol 24 remain unchanged.

## v1.4.0 — Dungeons & Delves Alpha 2 Web Hotfix 1
Web-only Dungeon Board presentation fix. Adds the wide crystal-dungeon board background as a real DOM image layer, normalizes the Dungeon Board collapse control to the shared 38px board button, and preserves right-closed/down-open pointer state. Hosted runtime/Bot remain `1.4.0-dungeons-a2`; frontend revision advances to `1.4.0-dungeons-a2-h1`; schema 10 / sync 1 / protocol 24 unchanged.

## v1.4.0 — Dungeons & Delves Alpha 2
- Adds The Emberglass Foundry as the second persistent Dungeon and adds Crossroads route decisions/discoveries to both current delves.
- Preserves schema 10; Portal Action protocol advances 23 → 24 for `DUNGEON_CHOICE`.
- Normalizes shared collapse-hand rendered size while preserving right/closed and down/open state behavior.

## v1.4.0 — Dungeons & Delves Alpha 1
- Added the first persistent seven-room Dungeon and Adventure Board Dungeon controls.
- Schema 10 / Portal Action protocol 23.
- v1.3.1 UI4 and Asset Optimization behavior retained.

## v1.3.1 — Asset Optimization
- Converts all 390 remaining shipped PNG artwork files to smaller lossless WebP assets with exact rendered-pixel preservation.
- Updates active artwork routes/manifests and reduces the Web distribution footprint without gameplay changes.
- Runtime/frontend revision: `1.3.1-asset-optimization`; schema 9 / sync 1 / Portal protocol 22 unchanged.

## v1.3.0 — Guild Expansion
- Final production release and public update-history cleanup.
- What's New now lists shipped releases only; Alpha/Beta/RC milestones remain in this engineering history but are no longer player-facing.
- Final Web/frontend runtime is `1.3.0-guild-expansion`; schema 9 / sync 1 / Portal protocol 22 remain unchanged.

## v1.3.0 — Guild Expansion RC2
- Final pre-release package/metadata hardening with no gameplay or balance changes.
- Refreshes stale bundled finalization audit metadata and keeps public Guide/Web/package identity synchronized.
- Pairs with the RC2 Bot; schema 9 / sync 1 / Portal protocol 22 remain unchanged.

## v1.3.0 — Guild Expansion RC1
- Feature-frozen release candidate for the complete Guild Expansion line.
- Normalizes release identity and Player Guide major-facility terminology while preserving all Beta behavior.
- Pairs with the RC1 Bot; schema 9 / sync 1 / Portal protocol 22 remain unchanged.

## v1.3.0 — Guild Expansion Beta 3
- Pairs with the Beta 3 Bot for shared Fellowship/Airship hardening.
- Fellowship contribution actions carry the rendered project ID so stale tabs cannot donate to a newly selected project.
- Preserves the Beta 2 priority/mobile Fellowship layout and Beta 1 economy; schema 9 / sync 1 unchanged, Portal protocol advances to 22.

## v1.3.0 — Guild Expansion Beta 2
- Web-only Fellowship UX & Mobile Consolidation pass.
- Reorders the public Fellowship page around Current Project, Airship status, Weekly Orders, and Guild Legacy before secondary reference detail.
- Adds browser-persistent disclosures for facilities, services, Airship catalog/upgrades, Expedition access, available Guild work, Legacy goals, and Deeds.
- Keeps active Airship mission state visible while moving deep mission/upgrade/history reference behind one disclosure.
- Preserves Beta 1 economy tuning and the compatible `1.3.0-guild-expansion-b1` Bot; schema 9 / sync 1 / protocol 21 unchanged.

## v1.3.0 — Guild Expansion Beta 1
- Advances the public Web identity and What's New summary to the v1.3 balance pass.
- Preserves Alpha 5 Hotfix 1 Founding Hall artwork and collapsible Equipment & Inventory groups.
- Pairs with the Beta 1 Bot for tuned authoritative Guild/Airship project requirements.

# Crystal Guild v1.3.0 — Guild Expansion Alpha 5 Hotfix 1

Web-only presentation hotfix. Adds the portrait Founding Hall backdrop to Guild Legacy Stage 1 and independently collapsible, browser-persistent Equipment & Inventory category groups. Hosted runtime/Bot remain `1.3.0-guild-expansion-a5`; frontend revision advances to `1.3.0-guild-expansion-a5h1`. Schema 9 / sync 1 / protocol 21 unchanged.

# Crystal Guild v1.3.0 — Guild Expansion Alpha 5

Adds Guild Legacy accomplishments, trophy/Hall progression, expanded Guild Service Records, and player-facing Legacy Guide/Fellowship surfaces. Runtime/frontend `1.3.0-guild-expansion-a5`; local DB schema 9, hosted sync 1, Portal protocol 21.

# Crystal Guild v1.3.0 — Guild Expansion Alpha 4

Adds the persistent Guild Airship: live Airship Dock construction, one-time Airship build project, six shared timed missions, five upgrade tracks, contributor rewards/history, streamer launch control, Fellowship/Guide surfaces, and schema-9 persistence. Runtime/frontend `1.3.0-guild-expansion-a4`; local DB schema 9, hosted sync 1, Portal protocol 21.

# Crystal Guild v1.3.0 — Guild Expansion Alpha 3

Adds Guild Services & Workshop: Workshop material refining, Chocobo Stable XP training bonuses, Guild Archive rare-Expedition-event research, Portal Fellowship service controls, and matching player Guide updates. Runtime/frontend `1.3.0-guild-expansion-a3`; schema 8, hosted sync 1; Portal protocol advances **20 → 21** for `WORKSHOP_EXCHANGE`.

# Crystal Guild v1.3.0 — Guild Expansion Alpha 2

Adds Guild Projects II presentation, Supply Drive / Guild Objective categories, Weekly Order contributor rewards, and matching player-facing Guide updates. Runtime/frontend `1.3.0-guild-expansion-a2`; schema 8, hosted sync 1, protocol 20 unchanged.

# Crystal Guild v1.3.0 — Guild Expansion Alpha 1

Begins Guild Expansion with a five-facility Guild Board, Lv. 0–3 major-facility presentation, shared construction requirements, and a visible but locked Airship Dock. Existing v1.2 facility tiers and benefits are preserved. Runtime/frontend `1.3.0-guild-expansion-a1`; schema 8, hosted sync 1, protocol 20 unchanged.

# Crystal Guild v1.2.0 — Expeditions

Final release promoted from the validated RC1 baseline with no gameplay changes. Expeditions, regional progression, Legendary Contracts, Chocobo specialization, balance tuning, UX/mobile/accessibility polish, and release hardening are now the v1.2 production baseline.

# Crystal Guild v1.2.0 — Expeditions Beta 4
## Release Hardening

Beta 4 keeps the v1.2 feature set frozen and hardens the persistent Adventure/release path before RC1.

### Persistent resource-pressure protection
- Long Rest no longer restores HP/MP/AP through an active distant Expedition or player-paced Wayfarer run.
- Stream-start roster refreshes skip players with those persistent runs active while still refreshing idle heroes once per Twitch stream session.
- The rule survives Portal reconnects and Bot/database restarts because active-run ownership is checked from SQLite.

### Crash-atomic persistent Adventure actions
- Persistent Solo/Expedition Portal mutations now execute inside the same outer SQLite transaction as their Portal replay receipt.
- If the receipt cannot commit, nested stage/cache/progress/reward/result writes roll back with it.
- A lost hosted acknowledgement can therefore be retried without duplicating Expedition stages, banked cache, Hunt Seals, result cards, or other persistent rewards.
- Timed Hunts retain their established live in-memory coordination/replay path.

### Restart, migration, and integrity drills
- Active Expedition stage, route, cache, Journal, and saved state are verified across a database/engine restart.
- A representative pre-v1.2 schema-7 Guild migrates to schema 8 with level, XP, Gil, HP/MP/AP, inventory, Chocobo data, and the verified pre-schema-8 backup preserved.
- Existing recovery-drill, database-integrity, synthetic stress, queue/replay, LIVE/OFFLINE, and outage-recovery suites remain enabled.

### Published timing cleanup
The Player Guide metadata is synchronized to the authoritative current defaults: 60-second Venture rally / 30-second rounds and 90-second Raid rally / 60-second rounds.

### Compatibility
- Bot runtime: `1.2.0-expeditions-b4`
- Hosted Web runtime: `1.2.0-expeditions-beta4`
- Frontend asset revision: `1.2.0-expeditions-b4`
- Local DB schema: **8**
- Hosted sync schema: **1**
- Portal Action protocol: **20**
- Twitch prefix: `!`
- Player reset: **none**
- New environment variables: **none**

# v1.2.0 — Expeditions Beta 3

Feature-frozen Mobile & Accessibility Polish: stronger phone layouts, 44px coarse-pointer touch targets, safe-area and dynamic-viewport handling, Arrow/Home/End keyboard tab navigation, explicit dialog/menu focus behavior, and increased-contrast/forced-colors/reduced-motion support. Beta 2 Hotfix 2 portrait backdrops and Beta 1 gameplay balance remain unchanged.

# v1.2.0 — Expeditions Beta 2 Hotfix 2
Web-only portrait scenic-background fit pass and duplicate-airship cleanup. Hosted runtime remains `1.2.0-expeditions-beta2`; frontend revision `1.2.0-expeditions-b2h2`; compatible Bot `1.2.0-expeditions-b1`; protocol 20 and DB schema 8 unchanged.

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

