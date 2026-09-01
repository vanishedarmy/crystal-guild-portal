# Crystal Guild v1.6.0 — Gold Saucer Alpha 5 Web Hotfix 6 — Triple Triad Opponent UI Pass

Hotfix 6 removes the wide Triple Triad **Choose Opponent** banner shown between the section heading and the opponent cards. The image is removed from the active render path and is no longer used as an opponent fallback.

## UI changes
- Opponent selection now flows directly from the compact heading into Saucer Attendant, Card Shark, and Crystal Master cards.
- The collection badge now reads `X / 15 cards collected`.
- The selected opponent is explicitly marked **SELECTED** in the card metadata.
- Desktop opponent artwork is shortened to reduce vertical dead space.
- Mobile opponent cards switch to a compact portrait-left / details-right layout instead of stacking a large image above the copy.
- The selected-match strip is visually tightened beneath the opponent cards.

No Triple Triad rules, card values, MGP costs/payouts, card collection, schema, or Portal actions change. The complete H5 Triple Triad art family remains packaged and served from `/gold-saucer/a5h5/triple-triad/`; H6 simply stops rendering the `ui/opponents.webp` header.

Contract: runtime/Bot `1.6.0-gold-saucer-a5h5`, frontend `1.6.0-gold-saucer-a5h6`, schema **13**, hosted sync **1**, Portal protocol **29**.
