# Crystal Guild v1.9.0 Alpha 9 — Bestiary Discovery

- Reworked the Portal Bestiary with responsive research cards, searchable and filterable dossiers, progress bars, habitats, lore and discovery-stage visibility.
- Introduced research progression for 90 ordinary monsters (20 defeats), 17 Hunts (5 clears/defeats), and 5 Expedition bosses (3 clears). All 112 core entries retain their original IDs and preexisting defeat history.
- Schema 22 adds a durable idempotent core mastery ledger: one permanent Mastery Seal and one Research Point per mastered core entry. Backfills existing eligible players without a reset. Material-drop bonuses are not enabled.
- Unified 37 raid/boss records, 10 World Event variants and 5 seasonal records into the same collection using separate scoped IDs. All special rewards remain in their owning systems; no duplicate seals or Research Points.
- Filled the five Expedition boss art gaps with individual 512×768 WebP portraits. Existing regular monster art uses a matching locked silhouette; the seasonal event retains its own locked art.
- Full baseline preservation: no changes to existing combat balance, Hall of Trophies ownership, seasonal activation, hosted sync schema (1), or Portal Action protocol (37).
- Automatic verified schema 21→22 backup and migration on Bot startup, preserving players, inventory, bestiary rows and historical event editions. Preserve your live database and secrets when deploying.

## Earlier release: v1.9.0 Alpha 8 — Seasonal Event Framework


## Halloween Individual Artwork Hotfix 3
- Replaced the original composite-derived Halloween imagery with 31 individually packaged WebP assets from the eight approved art batches: 10 monster/Warden states, 5 currency/shop icons, 8 permanent/locked trophies, 4 banners and 4 backgrounds.
- The Bestiary and trophy cards now display uncropped art (`object-fit: contain`); the seasonal wallet, shop and optional scenery gallery use the proper independent images. The Warden displays its locked image until earned.
- Added a revision query to seasonal art URLs so browsers refresh retired images after deployment. Fixed the purchase button guard for the intentionally repeatable Spooky Supply Cache.
- Web-only: Bot, schema 21, hosted sync 1, Portal Action protocol 37, event activation defaults, seasonal rewards and combat odds are unchanged.

## Navigation & Seasonal Event Hotfix 2
- All 18 Adventurer Profile destinations now form three even six-column desktop rows; removed the old 17-tab offset and full-width mobile final-button rule. Compact-desktop navigation centers its final pair.
- The hosted player API now serves the seasonal profile module; previously the route returned an "Unknown player module" 404, leaving the Seasonal Event page loading indefinitely.
- Historical player snapshots without a seasonal module display a clear "Waiting for event data" state until the updated Bot syncs, instead of a blank screen.
- Failed profile section requests show an error and a working Retry Section control.
- Web-only fix: the Bot is unchanged. Schema 21, hosted sync 1, Portal Action protocol 37, game balance, and seasonal activation defaults are unchanged.

Alpha 8 builds one reusable seasonal/event rotation system and ships **Night of the Hollow Crystal** as the first event edition. Seasonal content is a layer over existing Ventures, Hunts, World Events, rewards, profiles, and the Hall rather than a second combat system.

## Reusable seasonal framework
- Persistent event editions with **manual**, **scheduled**, **paused**, **redemption**, and archived/disabled presentation states.
- Event definitions carry their own monster variants, World Event additions, objectives, currency, shop catalog, artwork, and permanent event trophies.
- The Halloween 2026 edition is installed **disabled by default**; deployment alone never starts seasonal content.
- Streamer Control Center can enable/disable, pause/resume, switch manual/scheduled operation, and inspect current event status.

## Night of the Hollow Crystal
- Four FF-styled seasonal monster variants: **Jack-o’-Bomb, Graveyard Coeurl, Lantern Tonberry, and Wraith Ahriman**.
- Eligible seasonal variants supplement ordinary encounters at a controlled replacement rate and use the existing encounter engine.
- **The Hollow Warden** joins the normal World Event selection while Halloween is active, without increasing the overall World Event spawn rate.
- Seasonal monster kills, eligible Ventures/Hunts, and the Warden feed rotating daily personal/Guild objectives.
- **Moonlit Tokens** fund the temporary **Moonlit Emporium**. Ordinary monster token rewards are daily-capped, while objective claims and first-clear Warden credit are replay-safe.

## Rewards and permanent collection
- **Spooky Supply Cache** — repeatable ordinary supplies.
- **Nightwatcher** — permanent character Title.
- **Haunted Candle** — permanent seasonal keepsake.
- **Hollow Crystal Display** — permanent seasonal display collectible.
- Four permanent seasonal trophies: **A Light in the Dark, Things That Go Bump, The Warden’s Seal, and Keeper of the Hollow**.
- Seasonal trophies do not alter the original Hall of Trophies 30/30 Phase-1 completion contract.

## Persistence and compatibility
- Local schema: **21**, automatic migration from schema 20 with verified `pre_schema_21_<timestamp>.db` backup.
- Hosted sync schema: **1**.
- Portal Action protocol: **37**.
- No player reset, normal economy rebalance, ordinary combat/reward rebalance, or Gold Saucer rebalance.

## Package cleanup Hotfix 1 (same Alpha 8 runtime)
- Consolidated prior release/hotfix reports into `CHANGELOG.md`.
- Removed superseded Triple Triad `a5h3` and `a5h4` asset trees; current `a5h5` routes are unchanged.
- Removed byte-identical legacy Hunt/Raid background aliases and updated the scene manifest to the existing live `h4` routes.
- Updated stale root README and deployment guides to schema 21/protocol 37.
- Preserved all migrations, gameplay assets, runtime code and permanent player data. No economy, combat or event changes.
