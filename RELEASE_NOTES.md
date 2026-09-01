# Crystal Guild v1.6.0 — Gold Saucer Alpha 5 Web Hotfix 4
## Triple Triad Artwork Recovery + Gold Saucer UI Pass

### Triple Triad artwork recovery
- Fixes the H3 card-art stacking defect: `.triad-card-art` was placed at a negative z-index behind the card's opaque background, so packaged portraits could be present but invisible.
- Moves card artwork into the visible card stacking layer while keeping the shade, name, rarity, and authoritative four-side values above it.
- Republishes the complete **33-WebP** Triple Triad family at the cache-busted `/gold-saucer/a5h4/triple-triad/` path. The H4 images are byte-identical to the validated H3 artwork; only the route changes for cache recovery.
- Adds resilient image fallback behavior for card, hero, opponent, result, deck, and collection imagery.
- Keeps illustrated context banners visible at mobile widths instead of suppressing them below 540px.
- Adds opponent-selection and collection context artwork directly to their live UI sections.

### Gold Saucer disclosure UI
- Replaces the Gold Saucer-specific text chevrons with the shared right/down finger-pointer image controls already used by the Portal.
- Applies the shared pointer treatment to Monster Toss, Chocobo Racing, Triple Triad, Prize Counter, Saucer Ledger, Recent Activity, Future Attractions, Triple Triad Card Collection, Monster Toss Score Rewards, and the Saucer Ledger balance details.
- Preserves the requested floor rule: **Mini Cactpot and Crystal Slots stay permanently open**; the remaining major Saucer sections remain collapsible.
- Tightens disclosure header spacing and mobile wrapping so the badge and finger pointer remain easy to tap/read.

### Preserved contract
- Retains H1/H2 Gold Saucer render recovery and retryable failure handling.
- Retains the H2 quantity-input fix for Emporium Buy/Sell, Blacksmith crafting, and Fellowship Workshop batches.
- Runtime/Bot remains `1.6.0-gold-saucer-a5`; frontend advances to `1.6.0-gold-saucer-a5h4`.
- Schema **13**, hosted sync **1**, Portal Action protocol **29**, prefix `!`, MGP balances/economy, Triple Triad rules/stats, and all gameplay are unchanged.
