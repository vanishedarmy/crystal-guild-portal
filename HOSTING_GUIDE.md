# Crystal Guild Alpha 13 Trading Post — Matching runtime requirements

Current Bot/Web release: `1.9.0-trading-post-qol-alpha13`. Portal Action protocol **39**, local Bot schema **25**, hosted sync **1**. Preserve existing tokens, databases and environment secrets. Follow `START_HERE.md`.

# Crystal Guild Portal — Hosting Guide (v1.9.0 Alpha 12)

Deploy matching Alpha 12 Web and Bot runtime `1.9.0-camp-recovery-alpha12`; local Bot schema **24**, hosted sync **1**, Portal Action protocol **38**. The hosted sync database schema is unchanged; the Bot's local schema 23→24 migration creates a verified backup. Preserve all existing live data, assets, OAuth/session credentials and private configuration.

The one-ZIP handoff already includes `Web/frontend/public/`. Run `npm ci && npm run build` in `Web/frontend/`; never reuse an old `dist`. Use your existing hosting provider configuration, bind the hosted SQLite file and static assets to persistent volumes, and test new Camp actions against the matching Bot before switching production traffic. See `UPGRADE_GUIDE.md`.
