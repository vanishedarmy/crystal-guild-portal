# Forge Gear Priority Hotfix — Upgrade Guide

1. Deploy the full Web package over the current ii28 Web build, or apply the ii28 → ii29 patch.
2. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii29`.
3. Open Adventurer Portal → Blacksmith → Forge Gear.
4. Confirm equipped items appear first, followed by forged + gear by level, followed by +0 gear by level.
5. No Bot deploy, DB migration, OAuth change, protocol change, or player reset is required for this Web-only sorting update.
