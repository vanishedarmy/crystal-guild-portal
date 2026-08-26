# Inventory PNG Regeneration R03–R06 Upgrade Guide

1. Deploy this Web package over the current `1.1.18-retro-phase-ii35` Web deployment, or apply the supplied ii35 → ii36 patch.
2. Publish the new `frontend/public/retro-phase-ii/item-icons-v3/` and `item-materials-v4/` directories.
3. Push/redeploy the hosted Web service normally.
4. Confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii36`.
5. Hard-refresh once so the new cache-busted PNG artwork loads immediately.
6. Spot-check Regen Tonic, War Horn, Bomb Fragment, Iron Ore, Mythril Ore, Ancient Coin, Dark Matter, Omega Core, and Shinryu Scale across Inventory, Guide, Blacksmith, and Moogle Emporium surfaces.

No Bot update, schema migration, player reset, OAuth change, or environment-variable change is required.
