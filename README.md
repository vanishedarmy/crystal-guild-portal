# Crystal Guild v1.2.0 — Expeditions Beta 2 Hotfix 1

Hotfix 1 corrects the remaining Beta 2 detail-card positioning issue. Beta 2 already preserved the background scroll position, but the retro window layer could still position the opened dialog relative to document layout. Detail dialogs are now fixed to the visible viewport: centered on desktop and presented as a bottom sheet on narrow/mobile screens.

Gameplay remains on the validated Beta 1 balance baseline and all Beta 2 UX consolidation remains intact.

## Compatibility
- Hosted Web runtime: `1.2.0-expeditions-beta2`
- Frontend asset revision: `1.2.0-expeditions-b2h1`
- Compatible Bot: `1.2.0-expeditions-b1`
- Local DB schema: **8**
- Hosted sync schema: **1**
- Portal Action protocol: **20**
- Migration/player reset: **none**
