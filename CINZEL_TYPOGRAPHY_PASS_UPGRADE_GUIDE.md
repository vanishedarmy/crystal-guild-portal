# Cinzel Typography Pass — Upgrade Guide

1. Deploy the full Web package over the current v1.1.18 Retro Phase II site, or apply the ii25 → ii26 patch.
2. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii26`.
3. Hard-refresh the site to clear the previous Pixelify Sans stylesheet from browser cache.
4. Confirm Guild Heroes, Adventurer Portal, character names, Bestiary names, boss names, and major Player Guide headings render in Cinzel.
5. Confirm body copy, stat values, tables, and dense controls remain on the existing readable UI font.
6. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
