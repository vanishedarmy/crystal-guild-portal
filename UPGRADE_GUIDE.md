# Upgrade Guide — Crystal Guild v1.1.19 Retro Phase III

## From the previous Retro Phase III build
1. Replace the current Web package with this build, or apply the included patch.
2. If applying the patch manually, delete the paths listed in `PATCH_DELETIONS_FROM_PHASE_III2.txt`.
3. Deploy as normal.
4. Hard-refresh the browser after deployment.
5. Confirm `/api/health` reports:
   - runtime `1.1.19-retro-phase-iii`
   - frontend asset revision `1.1.19-retro-phase-iii3`

No database migration, player reset, OAuth change, or environment-variable change is required.
