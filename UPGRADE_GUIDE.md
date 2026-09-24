# Upgrade to Crystal Guild v1.9.0 Alpha 11 — Mobile Combat HUD

**Baseline:** Complete matching Alpha 10 — Records & Moments Bot.zip, Web.zip and public.zip (the public assets were distributed separately). This Alpha 11 is a complete source package, not a patch for an unknown older build.

1. Back up the live Bot database, environment files, Twitch tokens, mounted persistent volumes and hosted secrets. Do not overwrite them with packaged examples.
2. Deploy the matching Alpha 11 `Bot/` and `Web/` source trees. Place the contents of `public.zip` at `Web/frontend/public/` before building (the archive already has a single `public/` root).
3. Run `cd Web/frontend`, `npm ci`, `npm test --if-present` or `npm run test:unit`, then `npm run build` on the target platform. **Do not reuse the Alpha 10 `dist`**. Use the regular build Dockerfile, not the prebuilt-only Dockerfile until a new Alpha 11 dist exists.
4. Run Bot/Web regression tests and restart the matching services. Schema remains 23, hosted sync 1, Portal Action protocol 37 and seasonal event activation remains unchanged. No migration is expected from Alpha 10.
5. Mobile walkthrough: scroll a long fight, check HUD visibility, MP/AP switching, Ability and Item drawers above the bar, disabled commands, keyboard Escape, safe-area insets, and all six combat surfaces. Desktop command layout and existing API behavior must remain unchanged.
