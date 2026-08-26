# Upgrade Guide — iii6 to iii7

1. Deploy the iii7 Web build or apply the iii6 → iii7 patch.
2. No database migration or player reset is required.
3. The new verified material art resolves through `/retro-phase-iii/material-icons-v1/`.
4. Hard refresh the Portal after deploy so the new frontend asset revision is loaded.
5. Verify `/api/health` reports frontend asset revision `1.1.19-retro-phase-iii7`.

The patch introduces no required deletions from iii6.
