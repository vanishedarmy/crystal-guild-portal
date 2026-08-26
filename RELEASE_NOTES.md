# Crystal Guild v1.1.18 — Inventory Identity Cache-Bust Hotfix

This Web-only hotfix advances the frontend asset revision to `1.1.18-retro-phase-ii34`.

## What was actually wrong
The corrected ii33 artwork files themselves are valid, but the Phase 2 artwork kept the same public URLs used by ii32. Browsers and upstream static caches could therefore continue serving the older corrupted ii32 WebP responses even after deploying ii33. This made the live Portal still show fragmented dark armor and other stale equipment art while the files in the new package were already fixed.

## Fix
All 136 shared Phase 2 artwork files now live under new `-v2` public asset paths. Material, elemental crystal, weapon-family, weapon-tier, armor-tier, and accessory-family URLs therefore change at the network level and cannot resolve to cached ii32/ii33 copies.

The underlying corrected artwork is unchanged from the ii33 extraction repair. This hotfix is intentionally a cache-identity fix, not another destructive image-processing pass.

## Compatibility
- Frontend asset revision: `1.1.18-retro-phase-ii34`
- Compatible Bot runtime: `1.1.18-recovery-h1`
- Local DB schema: 5 unchanged
- Hosted sync schema: 1 unchanged
- Portal Action protocol: 14 unchanged
- Twitch prefix: `!` unchanged

No database migration, Bot update, OAuth change, environment-variable change, or player reset is required.
