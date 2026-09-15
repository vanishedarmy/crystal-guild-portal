# Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 5

## Mobile Help & Disclosure Alignment

This Web-only correction fixes inconsistent placement of the contextual **?** control and collapsible-section pointer on mobile.

### Mobile utility controls

- Contextual **?** and the collapse pointer now form one compact utility pair whenever they share a collapsible section header.
- The **?** sits immediately to the left of the pointer instead of drifting to a different row/edge.
- Both controls use a matching **34px** mobile visual size with a tighter shared gap.
- Section badges, readiness state, current-region labels, Hunt Seal wallet, and similar status content remain left while the help/pointer pair stays right.
- Dungeon Board receives an explicit right-column utility cluster so its previous grid rule cannot separate the two controls.
- Trial & Raid Board receives the same explicit paired alignment.
- Travel Regions, Hunts, Expeditions, and other shared collapsible-board headers use the same rule automatically.

### Compatibility

Desktop placement remains unchanged. Personalized Twitch settlement messages, Raid XP +50%, Contextual Quick Help behavior, HTTP Response Efficiency, item sorting/control-fit changes, Full Rest & Combat Continuity, and authoritative Gear Favorites remain intact.

Runtime/frontend remains `1.7.1-resynthesis-a2h5`; schema **16**; hosted sync **1**; Portal protocol **33**. No migration or player reset.
