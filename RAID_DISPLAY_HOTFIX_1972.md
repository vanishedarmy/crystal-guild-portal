# Crystal Guild v1.9.97.2 — Raid Display Hotfix (Web only)

## Confirmed code issue
The `LiveStreamCombatControls.jsx` component was reading the React state variable `preferredLimitTier` inside an `Array.find` callback before the corresponding `useState` statement was executed. When a character had any unlocked Limit Break techniques (Job Level 50+), the callback executed and raised `ReferenceError: Cannot access 'preferredLimitTier' before initialization`. The Profile's outer `SectionErrorBoundary` caught it and replaced the entire Stream Activities tab with “This section hit a display error.” When no techniques were unlocked, the `.find` callback never ran, so lower-level / spectator raid views could appear unaffected. This issue was not special to Ultros.

## Fixes
- Initialize the preferred Limit Break tier state before computing the selected technique.
- Add a nested `SectionErrorBoundary` around the Raid Board. Future raid-specific render failures will show a Retry Raid Board option without hiding Stream Ventures and World Events.
- Change `WEB_ASSET_REVISION` to invalidate Guide/asset caches associated with this Web source revision.
- Add an automated test that executes the actual combat component setup statements with representative unlocked/locked technique data.

## Installation
- **Preferred if your Web is already v1.9.97.2:** extract `CrystalGuild_v1.9.97.2_RaidDisplayFix_Web_Patch.zip` into the **parent** of your existing `Web/` folder and merge matching files.
- **If you prefer a full cumulative source merge:** extract `CrystalGuild_v1.9.97.2_RaidDisplayFix_Web_Merge.zip` into the same parent. It includes the full 1.9.97.2 Web content and the approved artwork; it is not a replacement for all historical public art, so preserve your existing `Web/frontend/public/` content.
- Preserve production `.env` files and all persisted data. Build the frontend on your own build runner: `cd Web/frontend && npm ci --include=dev && npm run build` (or your existing dependency/build flow). Deploy the rebuilt frontend, then hard-refresh the player Portal.
- **No Bot ZIP, database migration, or Bot restart is required.** Existing v1.9.97.2 Bot raid gameplay and rewards are unchanged.

## Verification and limits
- New initialization test passes with an unlocked Lv50 technique, multiple unlocked tiers, and no technique; the new nested error boundary is verified by source inspection.
- Focused related frontend tests pass; some historical tests still assert retired release identifiers, so they are not proof of a regression in this patch.
- ZIP CRC and required file layout checks performed after packaging.
- No authenticated live Ultros raid or production frontend compilation was performed in this container (React/Vite node_modules not installed).
