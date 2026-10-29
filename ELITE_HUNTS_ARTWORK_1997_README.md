# v1.9.97 — Elite Hunts & World Events artwork integration

This cumulative Web tree includes all 13 approved artwork assets:
- Six S+/SS mark portraits matching the exact monster IDs.
- Three Elite World Event portraits matching World Event IDs.
- S+ and SS rank insignia, Elite World Event header and elite event marker.

`frontend/public/elite-hunts-197/` holds optimized assets used by the Portal.
`ARTWORK_MASTERS/elite-hunts-197/` holds the approved transparent original-resolution PNG images (not needed for public hosting).

Hunt portraits are mapped in `frontend/src/utils/monsterPortraits.js`. World Event artwork is mapped in both `Bot/crystal_guild/world_events.py` and the Portal's `StreamActivities.jsx`. Rank badges are shown on Hunt cards and the active Hunt header, while the Elite Event banner and marker are shown in Stream Activities.

The nine boss portraits and S+ crest come from separate Round 1 image generations. The three Round 2 UI assets were approved and cropped from a multi-asset composition, without upscaling. No original game art has been removed.

Preserve your older `Web/frontend/public` assets when merging. Build the frontend with `npm ci --include=dev && npm run build` from `Web/frontend` before deployment. The Bot's updated World Event art routes must be deployed together with Web.
