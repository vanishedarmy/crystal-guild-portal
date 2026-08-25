# Mobile Readability Hotfix — Upgrade Guide

1. Deploy the full Web package or apply the ii21 → ii22 patch.
2. Verify `/api/health` reports `1.1.18-retro-phase-ii23`.
3. Hard-refresh the Heroes directory and Adventurer Portal.
4. Check a long display name such as a 12+ character username: it should remain on one line without colliding with status.
5. Open Bestiary on a phone-width viewport: monster entries should render as readable cards rather than squeezed table columns.
6. No Bot deploy, DB migration, OAuth change, environment-variable change, or player reset is required.
