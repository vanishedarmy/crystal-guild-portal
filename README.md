# Crystal Guild — Web / Portal (v1.9.0 Alpha 8)

Player Portal, Streamer Control Center, and public artwork. Deploy with the matching Alpha 8 Bot.

**Runtime:** `1.9.0-seasonal-events-alpha8` · **Bot database schema:** 21 · **Hosted sync:** 1 · **Portal Action protocol:** 37.

This cleanup hotfix removes retired documentation and unreferenced older art revisions. It does not modify gameplay, event scheduling, saved progress or live component routes. See `UPGRADE_GUIDE.md` to remove old files when applying the maintenance patch to an existing installation.

**Documentation:** `HOSTING_GUIDE.md`, `PORTAL_ACTIONS_SETUP.md`, `STREAMER_DASHBOARD.md`, `RELEASE_NOTES.md` and condensed `CHANGELOG.md`. Asset manifests are retained for audit/validation.

**Frontend:** from `frontend/`, install the pinned dependencies and run the normal Vite production build. Halloween assets are under `frontend/public/seasonal/halloween-2026/`; the event remains disabled until enabled by the owner.
