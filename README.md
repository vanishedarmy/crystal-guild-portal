# Crystal Guild — Web / Portal (v1.9.0 Alpha 11 — Mobile Combat HUD)

Player Portal, Streamer Control Center, and public artwork. Deploy alongside the matching **Alpha 11 Bot**. This is source-only Web: install the pinned frontend dependencies and build with Vite in a deployment environment.

**Runtime:** `1.9.0-mobile-combat-hud-alpha11` · **Local Bot database schema:** 23 · **Hosted sync:** 1 · **Portal Action protocol:** 37.

## Records & Moments

Records now tracks additional personal bests. The Moments collection awards 12 unusual achievements and cosmetic Titles; seven secret identities remain hidden until earned. The artwork contains 12 individually named badge WebPs and 4 separate earned/locked Hall of Trophies WebPs. See `RELEASE_NOTES.md` for player-facing changes.

## Deployment

Begin with `UPGRADE_GUIDE.md` and `HOSTING_GUIDE.md`. Do not overwrite the Bot's real database, persistent runtime state or your private `.env` and authentication files. This complete source release is based on the matched **v1.9.0 Alpha 10 — Records & Moments** Bot, Web and separate public archive. Deploy the three matching Alpha 11 packages; do not overlay this onto an unknown older baseline.

**Validation status:** source-level backend and targeted frontend checks passed; inherited frontend failures, dependency-installed Vite production bundling and a deployed-browser visual walkthrough are outstanding. Check on staging before production.

## Historical notes

`CHANGELOG.md`, `HOSTING_GUIDE.md`, `PORTAL_ACTIONS_SETUP.md` and `RELEASE_VALIDATION.md` include historical feature and deployment guidance; some sections originally described the Alpha 8/9 baselines and should not be used as current upgrade instructions. The current upgrade source of truth is `UPGRADE_GUIDE.md`.
