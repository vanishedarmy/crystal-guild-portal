# Crystal Guild v1.8.0 Final — Stream Activities UI Refinement

This post-Final UI refinement separates live-stream-only adventures from the personal Adventure Board and removes old release-version labels from active game boards.

## Player-facing changes

- Added a dedicated **Stream Activities** tab directly beside Adventure Board in the Adventurer profile navigation.
- Moved **Stream Venture** presentation out of Adventure Board and into Stream Activities.
- Moved the existing **Trial & Raid Board** out of Adventure Board and into Stream Activities.
- Stream Activities now groups the Twitch-first flow in one place: Stream Venture status/rally information, active Venture combat status, recent Stream Venture results, and the full Trial & Raid Board.
- Adventure Board is now focused on Portal/off-stream play: Camp & Recovery, Dungeons, Chocobo Expeditions, Solo Venture, Travel Regions, and Hunts.
- Added a Stream Activities shortcut to Overview and updated Player Guide wording to point live group content to the new tab.
- Kept Stream Venture participation Twitch-first (`!venture`, `!join`, and timed battle commands) and Raid participation Twitch-first (`!raid`). No new Portal mutation path was added.

## Board identity cleanup

Visible release labels such as `v1.2`, `v1.4.0`, and `v1.6.0` were removed from live feature-board headers. Chocobo Stable, Chocobo Expeditions, Dungeons & Delves, Gold Saucer, Adventure Board, Stream Activities, and Trial & Raid presentation now use timeless player-facing names instead of historical version tags.

## Navigation fit

The profile now has 17 destinations. Desktop navigation remains a roomy six-column grid, with the final five-button row centered instead of creating a single orphan button on very wide screens. Existing tablet and mobile selector behavior remains intact.

## Compatibility

- Runtime/frontend remains `1.8.0-merc-final`.
- Local database schema remains **17**.
- Hosted sync schema remains **1**.
- Portal Action protocol remains **34**.
- No gameplay balance, reward, cooldown, combat, database, or backend changes.
- Bot package is unchanged from the v1.8.0 Final + Expedition UI baseline.
