# Monster Portrait Fix Pass — Upgrade Guide

1. Deploy the full Web package over the current v1.1.18 Retro Phase II site, or apply the patch from Wave 11 Completion.
2. Confirm `frontend/public/retro-phase-ii/monster-portraits-v10/` is published with the refreshed portrait files.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii18`.
4. Hard-refresh Bestiary, Hunts, Player Guide, and Adventure Board to clear stale browser assets.
5. Spot-check Ancient Mimic, Holy Dragon, Master Tonberry, Rift Drake, Tonberry King, and Void Tonberry.
6. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
