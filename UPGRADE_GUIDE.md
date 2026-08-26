# Upgrade — ii38 to ii39

1. Deploy the full Web package over `1.1.18-retro-phase-ii38`, or overlay the supplied ii38 → ii39 patch.
2. When using the patch, delete `frontend/public/retro-phase-ii/weapon-icons-v3/` after applying it. ii39 uses `weapon-icons-v4/` instead.
3. No database migration, Bot update, environment change, OAuth change, or player reset is required.
4. Deploy/restart the hosted Web service normally.
5. Confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii39`.
6. Hard-refresh the Portal once so cached weapon artwork is replaced.
