# Monster Identity Wave 5 — Upgrade Guide

1. Deploy the full Web package over the current v1.1.18 Retro Phase II hosted Web build, or apply the Wave 4 → Wave 5 patch.
2. Confirm `frontend/public/retro-phase-ii/monster-portraits-v5/` is published.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii9`.
4. Refresh the Player Guide, Bestiary, and Hunts pages so the cache-busted v5 monster portrait URLs load.
5. Spot-check Magic Pot, Malboro, Sea Serpent, The Riven Ronin, Adamantoise, Magitek Drone, Ahriman, Garuda, Malboro Overlord, and Death Claw.
6. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
