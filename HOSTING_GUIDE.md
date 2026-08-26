# Hosted Web deployment — v1.1.19 Retro Phase III

Deploy the full Retro Phase III package as the current hosted Web source, or apply the supplied ii40 → v1.1.19 patch and follow `UPGRADE_GUIDE.md`.

After deployment, confirm `/api/health` reports Web runtime `1.1.19-retro-phase-iii` and frontend asset revision `1.1.19-retro-phase-iii1`, then hard-refresh the Portal once.

No database migration, player reset, OAuth change, environment-variable change, hosted sync schema change, or Portal Action protocol change is required.
