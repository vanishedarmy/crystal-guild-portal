# Crystal Guild v1.2.0 — Expeditions Alpha 2 Hotfix 1

## Overview & Board Collapse

- Moves **Daily Guild Provisions** above **What's New** on the Adventurer Overview.
- Updates **What's New** to summarize Expeditions Alpha 2 regional objectives, boss contracts, rare encounters, and Region Mastery.
- Makes **What's New** collapsible and remembers the browser preference; narrow/mobile layouts default collapsed when no preference exists.
- Makes the **Distant Expedition Board** collapsible with the same remembered preference behavior. Active Expeditions still open the board on a fresh Portal visit so current state is not hidden by a previously collapsed idle board.
- Keeps Travel Regions and Hunt Board collapse behavior unchanged.
- Web-only presentation hotfix. DB schema 8, hosted sync schema 1, and Portal Action protocol 20 are unchanged.

# Crystal Guild v1.2.0 — Expeditions Alpha 2

## Region Progress
- Adds a dedicated **Region Progress** panel to the selected Expedition region.
- Shows exploration percentage, 25/50/75/100% objective milestones, the next objective, boss unlock status, Regional Boss clear count, and Region Mastery status.
- Adds player-facing Mastery benefit summaries for all five regions.

## Regional Boss Contracts
- Adds an explicit Regional Boss Contract launch control once a region reaches 75% exploration.
- Boss Contracts are available for Elder Ochu, Inferno Drake, Malboro Sovereign, Frost Behemoth, and Rift Wyrm.
- Active Expedition presentation clearly labels Regional Boss encounters/contracts.

## Continuity
- Keeps the Alpha 1 Hotfix 3 Expedition Board map-room artwork, five regional backdrops, collapsible Travel Regions/Hunt Board, and concise copy pass.
- Hosted Web runtime: `1.2.0-expeditions-alpha2`
- Frontend asset revision: `1.2.0-expeditions-a2`
- Portal Action protocol: **20** (unchanged)
- Hosted sync schema: **1** (unchanged)
- Matching Bot runtime: `1.2.0-expeditions-a2` / local DB schema **8**
