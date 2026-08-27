# Crystal Guild v1.1.19 — Retro Phase III RC1 Hotfix 1

## Scenic Background Implementation Fix

This is a **Web-only RC hotfix** for the scenic background pass introduced in RC1. The Bot/runtime gameplay build remains unchanged.

### Fixed
- Camp & Recovery scenic artwork now renders as an actual visible scene layer.
- Guild Blacksmith scenic artwork now renders behind the workspace header/top content.
- Chocobo Stable scenic artwork now renders behind the Stable workspace.
- Moogle Emporium scenic artwork now renders behind the shop workspace.
- The scene assets moved from `scene-backgrounds-v1` to cache-busted `scene-backgrounds-v2` routes.
- The retired `scene-backgrounds-v1` directory is removed from the full hotfix Web package.

### Root cause
RC1 attached scene artwork to the same `::before` pseudo-element used by the shared `.panel` chrome. The shared rule sets that pseudo-element to a 1px accent line. Although RC1 overrode the inset and background image, the inherited 1px height remained, so the scene was effectively reduced to a thin line.

Hotfix 1 moves scenic panel artwork to an independent `::after` layer and leaves the shared `::before` accent rule untouched.

### Presentation
- Scenic art uses a visible upper scene band with a dark fade into the normal panel surface.
- Functional cards/toolbars receive translucent backing where needed for readability.
- Mobile uses a fixed compact scene band rather than stretching a landscape image through a tall single-column page.
- High-contrast preferences continue to reduce decorative artwork.

### Compatibility
- Hosted runtime: `1.1.19-retro-phase-iii-rc1` unchanged
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1h1`
- Local DB schema: **6** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **15** unchanged
- No Bot redeploy, database migration, player reset, OAuth change, or new environment variable is required.
