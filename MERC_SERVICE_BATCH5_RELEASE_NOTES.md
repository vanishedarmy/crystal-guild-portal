# Crystal Guild v1.8.0 Alpha 1 — Merc Service — Batch 5

Batch 5 completes the Merc Service presentation pass by integrating the approved SNES/Final Fantasy-style artwork into the live Portal experience.

## Artwork integration

- 12 dynamic Hero contract cards: available and unavailable states for Aerith, Tifa, Zidane, Yuna, Balthier, and Cloud.
- Card artwork is selected directly from the live `hero.available` state.
- Service hall hero art added to the Merc Service header.
- Contract and role artwork added to the contract briefing.
- Hunt, Venture, and Raid illustrations added to the mission explanation area.
- Future-roster artwork added beneath the Hero roster.
- All Merc Service assets are optimized WebP files.

## Responsive presentation

- Hero cards retain their 3:4 contract-card composition across desktop, tablet, and mobile.
- Mission illustrations collapse from three columns to stacked cards on narrower screens.
- Contract/role art reflows around the How It Works content and reduces density on phones.
- Reduced-motion users do not receive card hover animation.

## Runtime contract

No Bot gameplay rules, database migration, hosted sync schema, or Portal Action protocol changed in Batch 5.

- Runtime: `1.8.0-merc-a1`
- Local DB schema: 17
- Hosted sync schema: 1
- Portal Action protocol: 34

