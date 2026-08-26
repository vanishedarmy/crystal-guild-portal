# Inventory Identity Regeneration — Items R01–R06 Upgrade Guide

1. Deploy this Web package over the current `v1.1.18 — Retro Phase II` ii34 Web deployment.
2. Publish the new `frontend/public/retro-phase-ii/item-icons-v2/` and `item-materials-v3/` directories.
3. Push/redeploy the hosted Web service normally.
4. Confirm `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii35`.
5. Hard-refresh once so the new cache-busted item-art paths load immediately.
6. Spot-check Potion, Megalixir, Regen Tonic, Bomb Fragment, Iron Ore, Ancient Coin, Dark Matter, and Omega Core across Inventory/Guide/Blacksmith surfaces.

No Bot update, schema migration, player reset, OAuth change, or environment-variable change is required.
