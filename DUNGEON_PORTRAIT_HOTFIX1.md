# Crystal Guild v1.8.1 — Dungeon Monster Portrait Hotfix 1

## Fix

Dungeon combat cards could show the shared `Unknown Monster` fallback even when the encounter itself correctly identified the enemy (for example, `Skeleton · Lv. 9`).

The Dungeon Board was passing a legacy `monsterName` prop to the shared `MonsterPortrait` component. The component resolves artwork from the monster ID supplied through its `monster` prop, so Dungeon encounters never reached the packaged monster portrait map.

Dungeon combat now passes the complete enemy record plus its display name to `MonsterPortrait`. Existing packaged monster artwork is reused; no new monster art is required.

## Compatibility

- Release remains **v1.8.1 — Merc Recruitment**.
- Runtime/frontend identity remains `1.8.1-merc-recruitment`.
- Local database schema remains **18**.
- Hosted sync schema remains **1**.
- Portal Action protocol remains **35**.
- No player reset or migration.
- Active Dungeon runs remain compatible.
- Bot gameplay is unchanged.

## Validation

- Dungeon-focused frontend regression set: **35/35 PASS**.
- Full frontend regression suite: **672/672 PASS**.
- Hosted Web/API Python suite: **78/78 PASS**.
- Bot Python suite: **738/738 PASS**.
- Packaged `skeleton.webp` portrait verified present in the shared monster portrait catalog.
