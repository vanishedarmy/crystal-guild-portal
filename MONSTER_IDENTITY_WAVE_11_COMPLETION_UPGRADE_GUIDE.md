# Monster Identity Wave 11 Completion — Upgrade Guide

1. Deploy the full Wave 11 Completion Web package over the current v1.1.18 Retro Phase II site, or apply the Wave 10 → Wave 11 Completion patch.
2. Confirm the seven final portrait files are present under `frontend/public/retro-phase-ii/monster-portraits-v10/`.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii17`.
4. Hard-refresh the site to clear stale JS/CSS assets.
5. Spot-check Ancient Mimic, Skull Dragon, Brachosaur, Master Tonberry, Land Worm, Void Tonberry, and Mimic King in the Bestiary.
6. Confirm the Player Guide and any Hunt/Solo Venture surface for those monsters use the same portrait.
7. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
