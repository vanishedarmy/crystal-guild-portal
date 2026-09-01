# Crystal Guild v1.6.0 — Gold Saucer Alpha 5 Web Hotfix 3
## Triple Triad Artwork & UI

### Triple Triad visual family
- Adds 15 dedicated card portrait assets for every Alpha 5 collectible card: Chocobo, Moogle, Cactuar, Bomb, Flan, Tonberry, Coeurl, Ahriman, Malboro, Ifrit, Shiva, Ramuh, Leviathan, Bahamut, and Odin.
- Adds a dedicated card back and portraits for Saucer Attendant, Card Shark, and Crystal Master.
- Adds Gold Saucer Triple Triad hall/board scenery and Win, Draw, and Loss result scenes.
- Packages supporting deck-builder, collection, opponent-selection, tutorial, completion, and unlock artwork for future/conditional presentation.

### Authoritative-stat safety
- Generated full-card art is cropped into portrait layers before shipping.
- Decorative generated card numbers are not used by the game UI.
- Card rarity and top/right/bottom/left values continue to render from the authoritative Bot contract, so artwork can never silently change gameplay values.

### UI pass
- Triple Triad now has a dedicated scenic hero and illustrated live board.
- Hand/deck/collection cards use individual portrait artwork beneath the existing authoritative value overlay.
- Hidden opponent cards use the new card-back art.
- Opponent selection uses dedicated portraits with locked/selected states.
- Resolved matches show dedicated Win/Draw/Loss artwork.
- Full-collection state gains a celebration scene.
- Mobile layouts retain readable card values and collapse the nonessential scenic banners at narrow widths.

### Preserved fixes and contract
- Retains H1/H2 Gold Saucer render recovery and retryable failure handling.
- Retains the quantity-input fix for Emporium Buy/Sell, Blacksmith crafting, and Fellowship Workshop batches.
- Mini Cactpot and Crystal Slots remain permanently open; Monster Toss, Chocobo Racing, Triple Triad, Prize Counter, Saucer Ledger, Recent Activity, and Future Attractions remain collapsible.
- Runtime/Bot remains `1.6.0-gold-saucer-a5`; frontend advances to `1.6.0-gold-saucer-a5h3`.
- Schema 13, hosted sync 1, Portal Action protocol 29, prefix `!`, and MGP economy are unchanged.
