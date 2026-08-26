# Crystal Guild v1.1.18 — Web Upgrade Guide

1. Back up the current Web deployment.
2. Deploy the full Inventory Identity Phase 1 Web package or apply the ii30 → ii31 Web patch.
3. Keep the existing Bot runtime `1.1.18-recovery-h1`.
4. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii31`.
5. Confirm consumable icons appear in Recovery, Inventory, Moogle Emporium, detail dialogs, and the Player Guide.

No database migration, OAuth change, environment-variable change, protocol change, or player reset is required.
