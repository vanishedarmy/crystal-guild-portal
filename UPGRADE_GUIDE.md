# Upgrade Guide — iii10 to iii11

1. Deploy the full iii11 package or apply the iii10→iii11 patch.
2. No database, player-data, Portal Action, or hosted-sync migration is required.
3. Consumable artwork now resolves from `/retro-phase-iii/item-icons-v1/`.
4. Weapon artwork now resolves from `/retro-phase-iii/weapon-icons-v2/`.
5. Equipment-family artwork remains `/retro-phase-iii/equipment-families-v1/` and is PNG-only.
6. Hard-refresh once after deployment. The new asset paths also prevent the old images from being reused by browser/CDN caches.
