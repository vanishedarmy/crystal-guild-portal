# Crystal Guild v1.1.19 Retro Phase III RC1 Hotfix 8 — Raid Overlay Visual Rework

Hotfix 8 is a Web-only visual update focused on the hosted OBS raid overlay.

## New Raid HUD
- Replaces the plain rounded status card with a compact SNES/Final-Fantasy-inspired raid HUD.
- Boss artwork now lives in a dedicated framed art panel instead of functioning only as a faint full-card backdrop.
- Boss name, raid tier, living raiders, round, and phase have clearer visual hierarchy.
- Boss HP receives a stronger segmented bar treatment with exact HP, percentage, and a low-health pulse below 25%.
- Summon Gauge has its own compact crystal-blue progress meter.
- The top three damage leaders are rendered as individual scoreboard chips instead of one long text ticker.
- ENRAGED, VICTORY, and WIPE each receive distinct visual states.
- The overlay remains transparent outside the raid HUD and remains hidden when there is no current/still-fresh raid snapshot.
- Responsive rules keep the overlay readable in smaller OBS browser-source canvases.
- Reduced-motion preferences disable the low-HP pulse and meter transitions.

## Continuity
- RC1 Hotfix 7 Streamer Inventory Admin remains intact.
- Persistent Adventure results and explicit Confirm Result behavior remain intact.
- LIVE-only notable Portal Solo/Hunt/Title announcements remain intact.
- Dynamic Camp remains 15 minutes LIVE / 1 hour OFFLINE before existing Fellowship reductions.
- All 24 regenerated Relic Tier 1/2/3 visuals remain packaged.

## Technical identity
- Hosted Web runtime: `1.1.19-retro-phase-iii-rc1h8`
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1h8`
- Compatible Bot runtime: RC1 Hotfix 7
- Portal Action protocol: `18` (unchanged)
- Hosted sync schema: `1` (unchanged)
- Local Bot DB schema: `7` (unchanged)

No Bot update or database migration is required for this Web-only hotfix.
