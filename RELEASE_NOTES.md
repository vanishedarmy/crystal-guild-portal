# v1.6.0 Gold Saucer RC2 Web Hotfix 1 — Regenerated Triple Triad Cards

This Web-only hotfix replaces all 15 Triple Triad card faces with the finalized two-batch regenerated artwork. Every card uses one uniform purple/gold Crystal Guild template, the same four diamond value positions, the same nameplate/branding language, and a normalized 5:7 presentation.

The printed values match the existing authoritative RC2 Triple Triad parameters exactly. No card stats, rarity, deck rules, opponent decks, rewards, MGP values, schema, hosted sync schema, or Portal Action protocol changed. Runtime/Bot remains `1.6.0-gold-saucer-rc2`; frontend assets advance to `1.6.0-gold-saucer-rc2h1`.

The new card family is cache-busted at `/gold-saucer/rc2h1/triple-triad/cards/`. Existing H6 Triple Triad UI, opponent, result, board, card-back, and Gold Saucer collapse behavior remain unchanged.

# Crystal Guild v1.6.0 — Gold Saucer RC2 — Web

RC2 is the matched Web balance candidate for the complete five-attraction Gold Saucer.

## RC2 presentation/accounting

- Mini Cactpot displays the authoritative RC2 payout table delivered by the Bot.
- The Saucer Ledger now shows **Cactpot W / D / L** using net outcome against the 10 MGP ticket price.
- Balance details explicitly distinguish Mini Cactpot outcome accounting from Crystal Slots' long-run return target.
- The H5 full Triple Triad card faces, H6 compact opponent chooser, shared finger-pointer collapsibles, and Gold Saucer render recovery remain unchanged.
- Mini Cactpot and Crystal Slots remain permanently open; Monster Toss, Chocobo Racing, Triple Triad, Prize Counter, Saucer Ledger, and Recent Activity remain collapsible.

## Balance freeze

Only Mini Cactpot payouts change in RC2. Slots, Monster Toss, Chocobo Racing, Triple Triad, Prize Counter prices, MGP grants, daily limits, card values, and race curves are unchanged. See `reports/GOLD_SAUCER_BALANCE_AUDIT_RC2.md`.

## Contract

Runtime/frontend `1.6.0-gold-saucer-rc2`; local schema **13**; hosted sync **1**; Portal protocol **29**; MGP canonical. No database migration is required from RC1.
