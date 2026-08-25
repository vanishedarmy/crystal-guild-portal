# Monster Identity Wave 7 — Upgrade Guide

1. Deploy the full Web package over the current v1.1.18 Retro Phase II hosted Web build, or apply the Wave 6 → Wave 7 patch.
2. Confirm `frontend/public/retro-phase-ii/monster-portraits-v7/` is published.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii11`.
4. Refresh Adventure Board, Bestiary, Hunts, and Player Guide so the cache-busted v7 portrait URLs load.
5. Spot-check Crystal Wolf, Tonberry King, Red Dragon, Blue Dragon, Magitek Juggernaut, and Gold Dragon.
6. Enter a Solo Venture fight against any illustrated monster and confirm the enemy portrait remains visible beside the enemy stats.
7. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
