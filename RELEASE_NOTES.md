# Crystal Guild v1.6.0 — Gold Saucer Alpha 4 Web Hotfix 1
## Chocobo Racing Artwork & UI Pass

This Web-only hotfix completes the visual presentation for the Alpha 4 Chocobo Racing circuit without changing gameplay, MGP economics, daily limits, or race resolution.

### Artwork integration
- Adds a dedicated Chocobo Racing entrance/hero scene.
- Adds illustrated cards for Manderville Sprint, Crystal Circuit, and Golden Gauntlet.
- Adds illustrated pace cards for Steady Pace, Balanced, and Final Sprint.
- Adds first-place victory artwork and neutral race-complete artwork for non-winning finishes.
- Ships all nine active assets as optimized WebP under `/gold-saucer/a4h1/chocobo-racing/`.

### Racing UI pass
- Rebuilds the racing panel around a clear hierarchy: racer → last result → course → pace → selected entry → Race Now.
- Course cards expose eligibility/cost, selected state, description, and podium purse while keeping the artwork readable.
- Pace choices are now illustrated selection cards rather than plain buttons.
- The last-race panel combines result art, placement, course, pace, performance, and MGP payout.
- Adds explicit `aria-pressed` state for course and pace choices.
- Adds narrow-screen layouts and reduced-motion-safe hover behavior.

### Compatibility
- Hosted runtime: `1.6.0-gold-saucer-a4` unchanged.
- Frontend asset revision: `1.6.0-gold-saucer-a4h1`.
- Compatible Bot runtime: `1.6.0-gold-saucer-a4` unchanged.
- Local DB schema: **12** unchanged.
- Hosted sync schema: **1** unchanged.
- Portal Action protocol: **28** unchanged.
- Twitch prefix: `!`.
- No database migration, player reset, OAuth/environment change, MGP conversion, race rebalance, or Bot change.
