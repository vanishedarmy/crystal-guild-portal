# Hunt Board Timer Pass — Web Upgrade Guide

1. Deploy the full Web package over the current ii27 site, or apply the ii27 → ii28 Web patch.
2. Deploy the matching Bot Hunt Board Hotfix so the displayed rank timers and authoritative gameplay timers agree.
3. Verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii28`.
4. Open Player Guide → Hunt Board and confirm the four-step flow is Dispatch → Auto Hunt → Wait → Resolve.
5. Confirm Hunt cards display C 15m, B 30m, A 2h and S 5h timers.

No DB migration, OAuth change, environment-variable change, Portal Action protocol change, or player reset is required.
