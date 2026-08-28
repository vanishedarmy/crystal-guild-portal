# Validation Report — v1.2.0 Expeditions Alpha 1 Hotfix 2

## Identity
- Hosted Web runtime: `1.2.0-expeditions-alpha1`
- Frontend asset revision: `1.2.0-expeditions-a1h2`
- Compatible Bot runtime: `1.2.0-expeditions-a1h1`
- Portal Action protocol: **20**
- Hosted sync schema: **1**
- Local Bot DB schema: **8**

## Hotfix 2 validation
- Frontend Node regression suite: **297 / 297 passed**.
- Hosted Portal Python suite: **47 / 47 passed**.
- Hunts.jsx and Expeditions.jsx parse successfully as JSX with the installed TypeScript parser.
- Six optimized Expedition WebP assets are packaged and routed to the Board/five region surfaces.
- Travel Regions and Hunt Board collapse controls include ARIA expanded state and remembered local display state.
- Full Vite production bundle was not run in this environment because the package does not include `node_modules` and the local `vite` executable is unavailable.

---

# Validation Report — v1.2.0 Expeditions Alpha 1 Web

## Identity
- Hosted Web runtime: `1.2.0-expeditions-alpha1`
- Frontend asset revision: `1.2.0-expeditions-a1`
- Required Bot runtime: `1.2.0-expeditions-a1`
- Portal Action protocol: **20**
- Hosted sync schema: **1**
- Local Bot DB schema: **8**

## Automated validation
- Frontend Node regression suite: **294 / 294 passed**.
- Hosted Portal Python suite: **47 / 47 passed**.
- Paired Bot suite: **417 tests + 30 subtests passed**.
- Python modules compile successfully.
- Changed plain JavaScript modules and the hosted raid-overlay script pass `node --check`.

## Expedition UI / protocol coverage
- Five region cards and Scout/Journey/Deep depth selectors are present on the Adventure Board.
- Typed actions exist for start, stage resolution, combat action, route continue, Expedition Camp, safe return, and combat retreat.
- Countdown presentation uses authoritative Bot `server_now` timing.
- Active Expedition presentation includes route/stage state, cache, event/history, combat controls, Camp/return/retreat, and exploration progress.
- Persistent Expedition result cards share the explicit Confirm Result flow.
- Streamer Clear Adventures copy includes Expeditions.
- Chocobo Stable copy now reflects active Expedition trait bonuses rather than the old pre-v1.2 coming-soon state.

## Continuity
- H9 Raid/Rally timing and server-clock synchronization remain present.
- LIVE field support, Streamer Inventory Admin, H8 raid overlay styling/cleanup, dynamic Camp, Relic visuals, and persistent Solo/Hunt result behavior remain covered by the unchanged regression suite.
