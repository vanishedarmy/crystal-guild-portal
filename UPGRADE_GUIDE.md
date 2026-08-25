# Mobile Header & Guide Viewport Hotfix — Upgrade Guide

1. Deploy the full Web build over the current v1.1.18 Retro Phase II site, or apply the patch from the ii18 Monster Portrait Fix Pass.
2. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii19`.
3. Hard-refresh the site on mobile.
4. Portrait check: open Player Guide, scroll down, and confirm the Guide Sections/search controls move out of view naturally and the compact site header hides on downward scroll.
5. Landscape check: rotate the phone and confirm the desktop header stack is replaced by the compact roundel + LIVE/OFFLINE + hamburger header.
6. Open the Guide hamburger after scrolling and confirm the guide section drawer fills the usable viewport and closes normally.
7. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
