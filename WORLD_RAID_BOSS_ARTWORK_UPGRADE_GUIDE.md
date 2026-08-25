# World / Raid Boss Artwork Pass — Upgrade Guide

1. Deploy the full Web package over the current v1.1.18 Retro Phase II site, or apply the ii19 → ii20 patch.
2. Confirm `frontend/public/retro-phase-ii/boss-art-v1/` publishes all 37 WebP assets.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii20`.
4. Hard-refresh the Player Guide, Adventurer Portal, Trophy Hall/Records, and OBS `/overlay` browser source.
5. In Player Guide → Raids & Bosses, spot-check low-, mid-, and endgame entries such as Goblin King, Leviathan, Bahamut, Omega Weapon, Ozma, Penance, and Yiazmat.
6. During an active raid, verify the OBS overlay shows the matching boss artwork behind the raid status card without reducing text readability.
7. No Bot deploy, database migration, OAuth change, environment-variable change, or player reset is required.
