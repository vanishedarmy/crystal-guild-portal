# Crystal Guild v1.6.0 — Gold Saucer Alpha 1 Web Hotfix 1

## Gold Saucer visual treatment
This Web-only hotfix gives the Alpha 1 Gold Saucer its dedicated visual identity without changing any gameplay or economy rules.

- Gold Saucer Lobby, Mini Cactpot, Crystal Slots, and Prize Counter now use explicit scenic DOM image layers.
- Crystal Slots replaces placeholder text glyphs with individual WebP art for all six authoritative Alpha 1 symbols: Crystal, Moogle, Chocobo, Cactuar, Bomb, and Potion.
- New artwork ships under `/gold-saucer/a1h1/` for route-level cache busting.
- Scenic layers remain non-interactive and sit behind readable content on desktop and mobile.

## Compatibility
- Hosted runtime: `1.6.0-gold-saucer-a1`
- Compatible Bot: `1.6.0-gold-saucer-a1`
- Local DB schema: **11**
- Hosted sync schema: **1**
- Portal Action protocol: **26**
- Twitch prefix: `!`

No Bot update, DB migration, player reset, OAuth/environment change, SP cost/payout change, prize change, or slot-odds change is required.
