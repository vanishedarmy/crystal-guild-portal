# Retro Environment Pass — Upgrade Guide

1. Deploy the full ii21 Web package over the current ii20 site, or apply the ii20 → ii21 patch.
2. Confirm `frontend/public/retro-phase-ii/environment-pass/` is published.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii21`.
4. Hard-refresh the Portal, Fellowship, Player Guide, and Streamer Dashboard.
5. Check desktop heroes/panels for subtle airship/crystal ambience and gold section dividers.
6. Check portrait and landscape phone layouts: large environment decoration should be suppressed so content remains readable.
7. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
