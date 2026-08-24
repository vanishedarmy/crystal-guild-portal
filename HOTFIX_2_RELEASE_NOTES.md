# Crystal Guild v1.1.17 — Arsenal II Hotfix 2 Release Notes

Hotfix 2 standardizes the **mobile top header across the entire hosted site**.

## Mobile header

At phone widths, every major Crystal Guild page now uses the same compact header:

- **Crystal Guild roundel at the left**
- **LIVE / OFFLINE connection status** beside it
- **hamburger page menu** at the right

The hamburger opens the main page selector for Heroes, Fellowship, and Player Guide. The Streamer Dashboard also identifies itself in the same shared menu when opened directly. Sign-in/sign-out and the build label are moved into the mobile menu instead of consuming permanent header space.

The shared header now covers the Adventurer Portal, player profiles, Fellowship, Player Guide, Streamer Dashboard, and Privacy Policy. The Player Guide keeps its separate **Guide Sections** control below the site header for navigating within the guide.

The existing mobile scroll-away behavior is preserved. Opening the hamburger keeps the header visible until the menu is closed.

## Compatibility

- Hosted Web runtime: `1.1.17-arsenal-ii` unchanged
- Frontend asset revision: `1.1.17-arsenal-ii1h2`
- Bot runtime: `1.1.17-arsenal-ii` unchanged
- Local DB schema: **5** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **14** unchanged

No database migration, player reset, Bot replacement, OAuth change, or new environment variable is required.
