# Upgrade Guide — iii5 to iii6

1. Deploy the iii6 Web build or apply the iii5 → iii6 patch.
2. If applying the patch manually, delete the two retired folders listed in `PATCH_DELETIONS_FROM_III5.txt`.
3. No database migration or player reset is required.
4. The new Phase III equipment-family path intentionally changes the asset URLs, so stale browser/CDN copies of the old files cannot be reused.
5. After deploy, verify `/api/health` reports frontend asset revision `1.1.19-retro-phase-iii6`.
