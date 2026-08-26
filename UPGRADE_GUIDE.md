# Upgrade Guide — v1.1.18 Retro Phase II ii40 → v1.1.19 Retro Phase III

1. Back up the currently deployed Web source.
2. Prefer replacing the deployed source with the full v1.1.19 Retro Phase III package. If using the patch package, overlay it over ii40 and remove every path listed in `PATCH_DELETIONS_FROM_II40.txt`.
3. Keep the current Bot/player database. No migration or reset is required.
4. Deploy/restart the hosted Web service.
5. Confirm `/api/health` reports:
   - version `1.1.19-retro-phase-iii`
   - frontend asset revision `1.1.19-retro-phase-iii1`
   - hosted sync schema `1`
   - Portal Action protocol `14`
6. Hard-refresh the Portal once so clients pick up the new cache-busted artwork paths.
7. Spot-check Equipment & Inventory, Moogle Emporium, Player Guide item dialogs, and any firearm/Morbol Lash entries you can view.

The release intentionally retains existing Phase II fallback artwork for equipment identities not yet covered by a direct named sprite.
