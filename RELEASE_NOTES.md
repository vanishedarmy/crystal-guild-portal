# Crystal Guild v1.6.0 — Gold Saucer Alpha 2 Web Hotfix 2 / Canonical Baseline

## Monster Toss layout cleanup
- Removes the redundant standalone Monster Toss marquee that previously appeared above the normal attraction title row.
- Keeps the scenic Monster Toss background, text title, game-limit badge, start-state Play Monster Toss artwork, target art, throw-style art, score/throws UI, projectile/reticle, and result artwork.
- Prunes `marquee.webp` from the shipping public tree instead of retaining an unused asset.
- Moves the 17 active Monster Toss assets to `/gold-saucer/a2h2/monster-toss/` for clean cache busting.

## Compatibility
- Hosted runtime: `1.6.0-gold-saucer-a2` unchanged
- Frontend asset revision: `1.6.0-gold-saucer-a2h2`
- Compatible Bot runtime: `1.6.0-gold-saucer-a2` unchanged
- Local DB schema: **12** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **27** unchanged
- Twitch prefix: `!`
- No database migration, player reset, OAuth/environment change, new variable, SP balance change, or gameplay change.

This full Web tree plus the unchanged Alpha 2 Bot is the canonical baseline for subsequent v1.6.0 work.
