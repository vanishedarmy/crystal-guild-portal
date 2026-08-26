# Upgrade Guide — iii7 to iii8

1. Deploy the iii8 full Web build or apply the iii7 → iii8 patch.
2. No database migration or player reset is required.
3. No OAuth or environment-variable changes are required.
4. Hard-refresh the Portal after deployment so the new material sprites are fetched.
5. Verify `/api/health` reports frontend asset revision `1.1.19-retro-phase-iii8`.
