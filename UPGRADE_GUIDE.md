# Crystal Guild Web v1.1.14 — Cloud Continuity Hotfix 3a Upgrade

1. If the current site is exactly Hotfix 3, overlay the **Hotfix 3a Web Patch from Hotfix 3**. Otherwise use the full Hotfix 3a Web package.
2. Keep existing Render Web environment variables and OAuth settings unchanged.
3. Commit and push; let Render redeploy.
4. Confirm `/api/health` reports runtime `1.1.14-cloud-continuity-h3` and frontend revision `1.1.14-continuity3a`.
5. Open an Adventurer profile → Jobs and verify each Job card includes Battle Abilities, Passive Job Milestones, and JLv.50 Mastery.
6. Confirm ability rows identify JLv., MP/AP cost, target, description, and Ready/Locked state.
7. Open a Job detail dialog and confirm Combat Identity and Stat Growth are also present.
8. Check desktop and mobile widths for readable wrapped badges and single-column narrow layouts.

No Bot redeploy, hosted DB migration, new Web secret, or OAuth reauthorization is required.
