## v1.9.93 — Limit Break Awakening (18 Jobs · 72 Limit Breaks)

- Every playable Job unlocks four named Limit Break techniques at Job Levels 50, 75, 90 and 99. Job Mastery remains JLv.50, and the v1.9.92 169 active techniques and 90 passive milestones remain available.
- The Limit Gauge builds during battle, displays 0–100% progress, illuminates when ready, and resets when a Limit Break resolves. Queueing or changing an action in a raid does not waste charge.
- Limit Break categories are class-aligned: devastating damage, defensive party cover and counterstrike, party healing with high-tier revival, and party inspiration.
- Commands: `!limit` activates the strongest unlocked technique when charged, or `!limit 50`, `!limit 75`, `!limit 90`, `!limit 99` selects an unlocked tier. The raid overlay shows charge for participating heroes.
- Portal Solo Ventures, Expeditions and Dungeons also display the gauge and offer a dedicated Limit Break button. The Portal Overview What's New now includes detailed entries for **both** Job Ascension (v1.9.92) and Limit Break Awakening (v1.9.93), with expandable release history.
- Battle-scoped charge, no MP/AP spend. Backward-compatible persistence; no player table/schema change.
- Frontend production build and live Twitch/Portal verification are still required before public deployment.

## v1.9.91 — Equipment Expansion
- Integrated all 173 item illustrations (119 regular gear; 54 Ultimate forms) into Web and refreshed Player Guide. Gameplay catalogs and player state remain unchanged.

## v1.9.10 — Ultimate Relics and Equipment Beyond Lv.65

- Added 7 regular equipment tiers: Lv.70, 75, 80, 85, 90, 95, and crafted-only Lv.99 Paragon; 119 new equipment choices and 119 new recipes.
- Added 18 new Ultimate Relic lines, one per Job, with Lv.90/95/99 forms (54 new weapons).
- Ultimate starting objective requires the Job’s existing Zenith Relic, a mastered JLv.50 Job, and character Lv.90.
- Eternal completion requires an Eclipse Sovereign raid clear and final-world materials.
- Moogle Emporium and Twitch quick-buy use normal level and Job restrictions for new stock.
- Portal Relic Arsenal adds Classic and Ultimate filters; Ultimate visuals fall back to already existing Zenith artwork.
- No changes to stored equipment schema or existing Relic progression IDs.

# v1.9.8 — Airship Expedition

The Crystal Guild Airship is now the Fellowship's shared unlock for individual remote Expeditions. The old 24–48-hour passive mission **launches are retired**; any mission already in flight can finish and settle using its original persisted rules, and mission history and construction/upgrades remain intact.

- Three Airship-only regions: **The Shattered Sky Isles** (Lv.25+, Crystal Core 0), **The Aetherstorm Expanse** (Lv.35+, Core 1), and **The Forgotten Dominion** (Lv.45+, Core 2). The original five Chocobo regions are unchanged.
- Three new regional bosses and three sky-exclusive salvage materials, with persistent regional exploration, milestones and boss contracts.
- Per-player Airship Expeditions reuse the regular Expedition persistence, routing, combat and rewards; a Chocobo is not required for flying. Multiple members may travel independently.
- Airship upgrades: Hull lowers hazards and improves rescue retention; Engine shortens travel; Cargo increases gathered materials; Survey improves rare-event odds and exploration gains; Crystal Core gates distant regions. Tiers are copied when a flight launches so mid-flight guild upgrades cannot change its conditions.
- Airship-specific events: aerial ambushes, aetherstorms, emergency landings and floating ruins.
- Twitch chat: `!airshipregions`, `!airshipexpedition <region_id> [scout|journey|deep|boss|legendary]`, `!airshipstage`, `!airshiproute [safe|unknown|deep]`, `!airshipcamp`, `!airshipreturn`, `!airshipattack`, `!airshipdefend`, `!airshipretreat`. Existing `!airship` reports Guild construction and unlocked destinations. `!airshipmission` is disabled.
- Portal Expedition Board has separate Chocobo and Guild Airship routes. Fellowship page focuses on upgrades and remote regions, while prior mission history stays visible.
- No database migration required; persistent schema remains **27**, hosted sync schema **1**, Portal Action protocol **39**.
- **v1.9.7 Quick Gear Twitch chat commands remain present** in the full Bot.

**Deployment:** Always back up live Bot/Web databases, volumes and configuration before updating. Merge `Bot/` and `Web/` source patch into the existing tree; keep all image assets and secrets unchanged. Restart Bot, and rebuild Web/frontend through the source-build Dockerfile or normal `npm ci && npm run build`. The static v1.9.7 `frontend/dist` is not a v1.9.8 UI build; do not deploy with `Dockerfile.prebuilt` until the new bundle has been compiled. Do not wipe either database.

---

# v1.9.7 — Queen’s Blood

48 approved card portraits, 14-opponent solo circuit, live and correspondence invitations, compact illustrated Card Hall, server clocks and reconnect handling. Existing progression and saved matches are preserved. See RELEASE_NOTES.md.

## v1.9.6 — Shared Lock Icon UI

- Replace locked status text throughout compact Portal cards, badges, filters and controls with a shared accessible pixel-style padlock.
- Keep unlock instructions, useful numeric requirements and disabled-state rules.
- Include rebuilt frontend output and updated obsolete-chunk cleanup audit; retain the Triple Triad progression fix.

## v1.9.6 — Progression Hotfix 1

- Validate Triple Triad challenges against the bundled expanded catalog so all ten opponents can reach the Bot.
- Preserve Bot circuit locks, entry limits, active matches and saved progression.
- Add Web action and combined HTTP/Bot relay regression coverage. No npm rebuild or schema change.

## v1.9.6 — Triple Triad Expanded

- Expand Triple Triad to 45 cards, ten opponents and five circuits, with gentler novice play and five dedicated UI sections.
- Integrate all thirty approved card faces; preserve the original fifteen cards, saved decks, records and active matches.
- Align Bot, hosted Web and Portal release labels; refresh Overview What's New and include rebuilt frontend output.
- Remove audited superseded static files and provide hash-checked incremental-install cleanup.
- Database schema 26, hosted sync 1 and Portal Action protocol 39 stay unchanged.

# Changelog

## v1.9.0 Alpha 13 — Trading Post QoL
Character-saved 30-item watchlist, completed-sales 30-day weighted-price history, owned counts while browsing, price context after at least three sales, and a stock- and fee-checked quick relist. Schema 25 / Portal protocol 39.

# Crystal Guild Web/Portal — Release history

## v1.9.0 Alpha 12 — Camp & Recovery
- Trail Rations: purchasable or craftable one-run +10% Solo Venture damage, 45-minute departure timer, once-only consumption.
- One saved free pre-Venture plan: scout (+10% XP/JP), gear check (+8% damage), or supplies (+10% post-combat HP/MP/AP).
- Camp interface offers direct Potion/Tent recovery and retains original timed Camp. No new equipment durability.
- Local schema 24 with verified backup, hosted sync 1 unchanged, Portal Action protocol 38; matching Bot/Web releases, Player Guide and tests updated.

## v1.9.0 Alpha 11 — Mobile Combat HUD
- Mobile-only presentation hardening: viewport-anchored quick combat actions and dynamically measured Ability/Item drawers across Solo Ventures, Dungeons, Expeditions, stream Ventures, Raids and World Events.
- Live HP/resource readouts and existing authoritative action callbacks are unchanged; no combat balance, player records, schema, hosted sync or Portal Action protocol changes.
- Previous Alpha 10 Records & Moments features and all artwork carry forward.


## v1.9.0 Alpha 10 — Records & Moments
- Six collapsible personal-record chapters and 12 one-time Moments, including seven secret identities and cosmetic Titles.
- Individual 16-bit-style badges and Hall of Trophies rewards remain separate files; new personal unlock notices and responsive Records layout.
- Server-owned read-only player-specific projection and local schema 23 (hosted sync 1; Portal Action protocol 37).
- Source release; staging production bundling and deployed-browser walkthrough remain outstanding.

## Earlier releases
# Crystal Guild — Release History (Condensed)

## Alpha 8 — Halloween Individual Artwork Hotfix 3
Replaced the old sheet-derived seasonal art with 31 individually processed assets from all eight Halloween batches. Updated Bestiary, World Event, Moonlit Emporium, token and trophy card presentation, added independent event headers and an optional environment gallery; no combat, reward, schema, or Bot changes.

## Alpha 8 — Navigation & Seasonal Event Hotfix 2
Corrected the 18-tab profile navigation layout and enabled the missing hosted Seasonal Event API route. Missing legacy seasonal snapshots now show a sync-pending state, and profile request errors offer Retry instead of loading forever. Web-only; no schema, gameplay, or Bot changes.

Only major release milestones appear here. Historical hotfix reports and obsolete per-version audits are omitted from deployable source packages; original released archives remain available separately.

## v1.9.0 Alpha 9 — Bestiary Discovery
164 scoped Bestiary records, research stages and one-time permanent core mastery rewards; schema **22**, no sync/protocol change. Five standalone Expedition boss portraits and responsive research UI.

## v1.9.0 Alpha 8 — Seasonal Event Framework
Reusable, initially disabled event editions and the first Halloween event, **Night of the Hollow Crystal**. Four seasonal monsters, Hollow Warden World Event, Moonlit Tokens, daily objectives, temporary shop, and four permanent trophies. Schema **21**; Portal Action protocol **37**.

## v1.9.0 Alpha 7 — Hall of Trophies
30 permanent trophies, artwork and participant/contributor-aware reconciliation; schema **20**.

## v1.9.0 Alphas 1–6
Moogle Trading Post and economy adjustments; Titles/navigation improvements; World Events and mobile combat controls. Schema **19**.

## v1.8.0–1.8.2 — Merc Service
Hero Mercs, recruitment and Elite Merc roster; schema **17–18**.

## v1.7.0–1.7.1
Moogle Retainer, Moogle Emporium Annex, Gold Saucer refinements and Gear Resynthesis.

## Alpha 8 package cleanup Hotfix 1
Documentation/duplicate-asset maintenance only: consolidated release history, corrected current setup guides and removed retired Triple Triad asset generations. **Runtime, schema, protocol, rewards and gameplay remain unchanged.**
