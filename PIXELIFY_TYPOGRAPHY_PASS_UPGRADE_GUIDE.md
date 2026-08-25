# Pixelify Sans Typography Pass — Upgrade Guide

1. Deploy the full Web package over the current v1.1.18 Retro Phase II site, or apply the ii24 → ii25 patch.
2. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii26`.
3. Hard-refresh the site so the new stylesheet link and typography rules are loaded.
4. Confirm major headings and character names render in Pixelify Sans while body copy remains on the existing clean UI font.
5. Confirm the browser can reach `fonts.googleapis.com` and `fonts.gstatic.com`; if not, the defined local fantasy font fallback will be used automatically.
6. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
