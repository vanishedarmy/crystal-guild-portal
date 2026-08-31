# Crystal Guild v1.6.0 — Gold Saucer Alpha 2 Web Hotfix 1
## Monster Toss Visual Treatment

This is a Web-only visual update on top of the validated Gold Saucer Alpha 2 release. The matching Alpha 2 Bot remains unchanged.

### Visual additions
- Dedicated Monster Toss Gold Saucer scenic background and attraction marquee.
- Four separate target artworks: Small Pot, Medium Pot, Large Pot, and Golden Cactuar.
- Three separate throw-style artworks: Safe Throw, Normal Throw, and Power Throw.
- Dedicated crystal projectile and selected-target reticle.
- Separate hit and miss result artwork for individual throws.
- Dedicated score and throws-left presentation frames.
- Separate Bullseye and Jackpot completed-game result artwork.
- Dedicated Play Monster Toss start banner.
- All 18 assets ship as WebP under `/gold-saucer/a2h1/monster-toss/` for cache busting.

### UI integration
- Monster Toss uses an explicit DOM scenic image layer rather than CSS `background-image` routing.
- Target and throw-style artwork is bound to the actual authoritative target/style IDs.
- Selected targets receive the visual reticle without changing hit calculation.
- Throw history and the most recent throw display hit/miss art.
- The most recent completed game displays Bullseye, Jackpot, or Miss presentation based on the already-committed result.
- Mobile layouts and `prefers-reduced-motion` are covered by the visual layer.

### Compatibility
- Hosted runtime: `1.6.0-gold-saucer-a2`
- Frontend asset revision: `1.6.0-gold-saucer-a2h1`
- Compatible Bot: `1.6.0-gold-saucer-a2`
- Local DB schema: **12** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **27** unchanged
- Twitch prefix: `!`

No Bot update, database migration, player reset, OAuth/environment change, new required variable, Monster Toss accuracy/score/payout change, SP economy change, Gil economy change, or combat balance change.
