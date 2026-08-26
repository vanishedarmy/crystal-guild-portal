# Passive Recovery Hotfix — Upgrade Guide

1. Back up the existing Crystal Guild database as normal.
2. Deploy the updated Bot package and Web package together.
3. Start the Bot and verify `!cgversion` reports `1.1.18-recovery-h1`.
4. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii30`.
5. No database migration is required; Long Rest timestamps and the stream-session refresh marker use the existing `runtime_state` table.
6. Existing players begin their first eight-hour Long Rest window on their first intentional post-upgrade action.
