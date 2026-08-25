# Monster Identity Wave 11 — Upgrade Guide

1. Deploy the full Wave 11 Web package over the current v1.1.18 Retro Phase II site, or apply the Wave 10 → Wave 11 patch.
2. Confirm `frontend/public/retro-phase-ii/monster-portraits-v10/` is published.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii16`.
4. Hard-refresh Bestiary, Hunts, Player Guide, and Adventure Board to clear stale page assets.
5. Spot-check Cosmic Crystal Colossus, Stormforged Thunderwing, Infernal Phoenix, Abyssal Kraken King, and Obsidian Scorpion King.
6. Enter a Solo Venture encounter using an illustrated monster and confirm the enemy portrait remains correctly fitted.
7. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
