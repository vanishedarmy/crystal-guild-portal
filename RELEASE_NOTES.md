# Crystal Guild v1.2.0 — Expeditions Alpha 1 Hotfix 2

## Expedition presentation pass
- Adds optimized SNES/FF-style backing artwork for the Expedition Board and all five launch regions.
- Expedition region cards now use their region artwork directly; active Expeditions swap the board backdrop to the current region.
- Travel Regions and the Hunt Board are collapsible, remember the player's open/closed choice, and default closed on narrow/mobile views.
- Trims repeated explanatory copy across Expedition, Camp, Solo Venture, Rally Venture, and timed Hunt surfaces while preserving requirements, timers, rewards, and action guidance.
- Public release remains **v1.2.0 — Expeditions Alpha 1**; frontend asset revision advances to `1.2.0-expeditions-a1h2`.
- Web-only update. Portal Action protocol remains **20**, hosted sync schema remains **1**, and the compatible Bot remains `1.2.0-expeditions-a1h1` / local DB schema **8**.

# Crystal Guild v1.2.0 — Expeditions Alpha 1 Web

## Adventure Board — Expeditions
- Adds a full Expedition interface for the five launch regions: Emerald Wilds, Ashen Highlands, Mistfen Marshes, Frostveil Reach, and The Astral Scar.
- Region cards show level bands, regional identity/hazard, featured materials, and persistent exploration progress.
- Players choose Scout, Journey, or Deep Expedition and launch only when both the Fellowship Expedition Board and a registered Chocobo are ready.
- Active Expedition cards show stage/depth/route, authoritative travel countdown, carried cache, recent journey history, event state, combat state, current exploration progress, and Chocobo information.

## Interactive journey flow
- Resolve travel stages when the Bot deadline is ready.
- Choose Safe / Unknown / Push Deeper routes between stages.
- Resolve Expedition combat with Attack, Defend, available abilities, and eligible inventory items.
- Establish internal Expedition Camp after a cleared stage.
- Return safely to bank the cache, or retreat from combat using Chocobo rescue.
- Optional bonus stages allow a successful Expedition to push deeper before returning.
- Expedition result cards persist until **Confirm Result**.

## Continuity
- Adventure timers continue using Bot `server_now` synchronization.
- H9 raid/venture timing, LIVE field support, Streamer Inventory Admin, H8 raid overlay styling/final-state cleanup, dynamic Camp, Relic artwork, and persistent Solo/Hunt results remain present.
- Streamer **Clear Adventures** copy now includes Expeditions.

## Technical identity
- Hosted Web runtime: `1.2.0-expeditions-alpha1`
- Frontend asset revision: `1.2.0-expeditions-a1h2`
- Portal Action protocol: **20**
- Hosted sync schema: **1**
- Required Bot runtime: `1.2.0-expeditions-a1h1`
- Local Bot DB schema: **8**
