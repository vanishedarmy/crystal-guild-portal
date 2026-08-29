# Crystal Guild v1.3.0 — Guild Expansion Beta 2
## Fellowship UX & Mobile Consolidation

Beta 2 keeps the v1.3 feature set and Beta 1 balance frozen while making the expanded Fellowship substantially easier to scan on desktop and mobile.

## Current Guild priorities first
The top Fellowship snapshot now answers the four questions players are most likely to have:
- What Guild project is active?
- What is the Airship doing?
- How many Weekly Orders are complete?
- What Legacy stage has the Guild reached?

The full active project, live Airship state, and Weekly Orders remain high in the page flow. Facilities and long-term reference ledgers no longer push current activity down the page.

## Remembered Fellowship disclosures
The following secondary areas can stay open or closed independently, with that choice remembered in the browser:
- Guild Facilities
- Facility Services
- Airship mission catalog / upgrade tracks / recent history
- Expedition Guild Board
- Available Guild Work
- Legacy Goals
- Fellowship Deeds

On narrow phone layouts, secondary information starts compact by default unless that browser already has a saved preference.

## Airship and Legacy consolidation
- Current Airship mission/ready/building state remains visible.
- Mission catalog, upgrade tracks, and mission history move behind one Airship detail control.
- Current Guild Hall Legacy stage and earned trophy shelf remain visible.
- The full permanent accomplishment ledger moves behind a Legacy Goals disclosure.

## Mobile & accessibility
- Priority cards stack cleanly through tablet and narrow-phone widths.
- Fellowship disclosure summaries retain at least 44px interaction targets and 48px on coarse-pointer devices.
- Keyboard focus is clearly visible on expandable areas.
- Long labels, badges, and Guild status text wrap instead of causing horizontal overflow.

## Feature freeze
No Guild economy, Weekly Order reward, Workshop service, facility requirement, Airship mission, Airship upgrade, Legacy threshold, Expedition, or combat value changes are included.

## Compatibility
- Hosted Web runtime: `1.3.0-guild-expansion-b2`
- Frontend asset revision: `1.3.0-guild-expansion-b2`
- Compatible Bot runtime: `1.3.0-guild-expansion-b1`
- Local DB schema: **9**
- Hosted sync schema: **1**
- Portal Action protocol: **21**
- Twitch prefix: `!`
- Player reset: **none**
- Database migration: **none**
