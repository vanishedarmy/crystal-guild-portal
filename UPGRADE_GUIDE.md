# Upgrade to v1.7.1 Resynthesis Alpha 1 Hotfix 1

This is a Web-only UI safety hotfix.

1. Keep the existing v1.7.1 Resynthesis Alpha 1 Bot and database.
2. Deploy the Hotfix 1 Web package or apply the Alpha 1 → Hotfix 1 Web patch.
3. Preserve hosted environment variables and secrets.
4. Confirm the Web reports runtime `1.7.1-resynthesis-a1` and frontend asset revision `1.7.1-resynthesis-a1h1`.
5. Open Blacksmith → Resynthesize Gear and verify the permanent-destruction warning appears before the gear list and again in the confirmation prompt.

No database migration, protocol change, player reset, or item rebalance is required.
