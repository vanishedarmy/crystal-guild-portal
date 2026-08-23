# Crystal Guild Web v1.1.14 — Cloud Continuity Hotfix 2 Upgrade

1. Back up/commit the current Web repository.
2. Overlay the Hotfix 2 Web patch.
3. Keep all existing Render Web environment variables and OAuth settings unchanged.
4. Commit and push; let Render redeploy.
5. Confirm `/api/health` reports runtime `1.1.14-cloud-continuity-h2` and frontend `1.1.14-continuity2`.
6. Open your own Adventurer Overview and confirm Daily Guild Provisions describes randomized provision bundles.
7. After the matching Bot token has the Twitch subscriber scope, subscribed viewers should see their tier-based Daily perk in the Daily card.

No hosted DB migration, new Web secret, or Web OAuth reauthorization is required.
