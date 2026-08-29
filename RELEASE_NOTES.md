# Crystal Guild v1.3.0 — Guild Expansion Alpha 5 Hotfix 1
## Founding Hall Scenic Backdrop & Collapsible Inventory

This is a Web-only visual and usability hotfix built on Guild Expansion Alpha 5. Guild Legacy, Airship, Fellowship, Workshop, combat, economy, and progression rules are unchanged.

## Founding Hall portrait scene
- Adds the newly generated 941×1672 SNES/FF-style **Founding Hall** artwork.
- The scene is routed to **Guild Legacy Stage 1 — Founding Hall** only.
- It fills the full Legacy panel height rather than rendering as a short header strip.
- Dark readability gradients and translucent accomplishment cards keep text and progress bars legible.
- High-contrast mode suppresses the decorative scene further.
- The stage-specific route is ready for separate Bannered Hall, Hall of Heroes, and Legendary Guild Hall artwork later.

## Equipment & Inventory collapse pass
- Weapons, Armor, Accessories, Consumables, and Materials are independently collapsible.
- Every group starts open for existing users unless that browser has a saved preference.
- Open/closed choices persist locally in the browser.
- Group headers are real keyboard-accessible buttons with `aria-expanded` / `aria-controls` state.
- Touch targets retain the existing 44px accessibility floor.
- The generic **Items** inventory label is now **Consumables** for clearer player-facing language.

## Compatibility
- Hosted Web runtime: `1.3.0-guild-expansion-a5` unchanged
- Frontend asset revision: `1.3.0-guild-expansion-a5h1`
- Compatible Bot runtime: `1.3.0-guild-expansion-a5` unchanged
- Local DB schema: **9** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **21** unchanged
- No database migration, player reset, OAuth change, new environment variable, or Bot redeploy is required.
