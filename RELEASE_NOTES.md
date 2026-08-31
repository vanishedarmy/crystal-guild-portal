# Crystal Guild v1.5.1 — Relic Arsenal Complete Web Hotfix 1

## Relic Artwork Refresh
All 18 Relic weapon lines now use the newly regenerated SNES/FF-inspired artwork across all three stages: Dormant, Awakened, and Zenith.

- 18 Relics × 3 stages = **54 refreshed weapon images**.
- Shipping format is **512×512 transparent lossless WebP**.
- Public routing moves from `relic-weapons-v1` to cache-busted `relic-weapons-v2`.
- Existing Relic IDs, stage state, item IDs, progression, economy, requirements, and gameplay are unchanged.
- The previous v1 asset family is left in place for safe rollback but is no longer referenced by current Relic/item artwork routing.

## Compatibility
Hosted/Bot runtime remains `1.5.1-relic-arsenal-complete`; DB schema 10; hosted sync 1; Portal Action protocol 25; Twitch prefix `!`. This is Web-only and requires no migration/reset/OAuth/environment change.
