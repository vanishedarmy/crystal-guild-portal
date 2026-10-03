# Crystal Guild v1.9.4.7 — Seasonal Event Page + Streamer Toggle Rework

## Scope
This is a Web/Portal UI update built on the current v1.9.4.7 Chocobo Stable rework baseline. It preserves the Retainer Service and Overview reworks already in that build.

The installed Bot should already include the Halloween 2026 live hotfix (Night of the Hollow Crystal scheduled through Nov. 2, 2026, with the updated Solo/Stream seasonal encounter rates). No Bot game-logic files are changed by this package.

## Seasonal Event page
The Seasonal Event tab has been reorganized to improve scanability and reduce the previous wall-of-cards layout:

- Rebuilt hero with a clear live-state badge, event/end dates, Moonlit Token balance, daily token-kill progress, collection progress, and Guild event defeats.
- Daily objectives are now a focused progress panel with compact progress bars and reward/completion states.
- Moonlit Emporium is promoted beside the objectives as the second primary action area, with a compact balance display and clearer item states.
- Event Bestiary now uses compact horizontal creature records instead of large equal-weight cards.
- The Hollow Warden is separated into its own World Event callout.
- Permanent Event Trophies and the Haunted Realm gallery are now secondary collapsible sections so they remain available without dominating the page.
- Responsive rules were added for desktop, tablet, narrow mobile, and very narrow mobile layouts.

No event rewards, objectives, token costs, encounter logic, trophy rules, or artwork files were changed.

## Streamer Dashboard seasonal toggle
The Streamer Control Center now includes a dedicated authenticated Seasonal Event switch near the top of the controls area.

- The switch reflects the currently synchronized event state and enabled flag.
- Turning it ON sends the existing allow-listed `seasonalevent on` backend action.
- Turning it OFF sends the existing allow-listed `seasonalevent off` backend action.
- The action remains broadcaster-only and still requires the existing verified Twitch/Portal authorization path.
- Current event name, state, schedule end, and activation mode are shown beside the switch.
- Existing advanced pause/resume/manual/scheduled/status controls remain available in the renamed **Advanced Seasonal Event Control** group.
- The hosted `/api/streamer` aggregate now exposes only a sanitized event-control summary; player token balances and other player-specific seasonal data are not included.

## Changed files
- `frontend/src/player/SeasonalEvent.jsx`
- `frontend/src/pages/StreamerDashboard.jsx`
- `frontend/src/styles/portal.css`
- `frontend/src/styles/streamer.css`
- `crystal_guild/hosted_portal.py`
- `frontend/tests/seasonalEventRework1947.test.mjs`
- `tests/test_hosted_portal.py`

## Validation
- Hosted Portal test suite: 30/30 passing.
- Seasonal/Streamer focused frontend checks: 10/10 passing.
- Modified JSX files transpile successfully with the installed TypeScript parser.
- Modified hosted Portal Python compiles successfully.

The repository's full legacy frontend test collection contains unrelated baseline failures in older feature assertions; this update was validated against the directly affected Seasonal Event, Streamer Dashboard, and hosted Portal surfaces.

## Deployment
This changes React/CSS source and hosted Portal Python, so deploy the Web package and restart/rebuild the hosted Web service normally. A frontend Vite rebuild is required unless your deployment pipeline builds the frontend automatically.

The Bot itself does not need a new code patch for this UI update, but the currently deployed Bot must support the existing `seasonalevent` Streamer command (the Halloween 2026 live-hotfix Bot already does).
