# Crystal Guild v1.9.0 Alpha 11 — Mobile Combat HUD

This is a **frontend presentation update** to the verified Alpha 10 Records & Moments Bot/Web/public baseline. Its quick combat HUD was first added during Alpha 6; Alpha 11 fixes the nested-sticky and picker-overlap limitations.

On mobile (760 px or less), the action bar is fixed to the bottom of the viewport instead of the scrolling battle card. It shows your HP, enemy HP/name, available MP/AP and four commands. The HUD height is measured so the active Ability/Item drawer opens just above it, with a scrollable list. It closes with the existing Close control or Escape, and full desktop combat decks remain in place. All combat actions still call the existing authenticated Bot/Portal endpoints.

**Compatibility:** Local Bot schema 23, hosted sync 1 and Portal Action protocol 37 are unchanged. No player-data migration, combat balance change, new artwork or new backend action is required. Deploy the matching Alpha 11 Bot metadata and Web source; use the separately supplied public archive for assets and updated Player Guide. Preserve your existing live database, configuration and secrets.

**Build requirement:** Web/frontend/dist from Alpha 10 must not be deployed unchanged. Install platform-native pinned dependencies in the build environment (`cd Web/frontend && npm ci && npm run build`). The delivered Web source package excludes the previous prebuilt dist so an outdated UI cannot be deployed accidentally.

**Validation:** Source wiring and Node/Python regression checks can be run before deployment. A fresh production Vite build and manual browser walkthrough at 320/375/390/760 px, landscape and mobile safe-area devices must be completed in the target build/browser environment.
