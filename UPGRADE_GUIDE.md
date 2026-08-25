# Monster Identity Wave 8 — Upgrade Guide

1. Deploy the full Web package over the current Wave 7 Image Fit Hotfix build, or apply the Wave 7 Hotfix → Wave 8 patch.
2. Confirm `frontend/public/retro-phase-ii/monster-portraits-v8/` is published.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii13`.
4. Hard-refresh the Adventure Board, Bestiary, Hunts, and Player Guide.
5. Spot-check Floating Death, Storm Dragon, Adamant Golem, Varuna, Astral Construct, Death Rider, Demonolith, Spirit, Crystal Dragon, and Machea.
6. Confirm Solo Venture combat still shows illustrated enemy portraits where available.
7. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
