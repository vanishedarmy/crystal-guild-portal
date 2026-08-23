# Crystal Guild v1.1.14 — Cloud Continuity Hotfix 3b Upgrade

Hotfix 3b is a Web-only refinement for an existing Hotfix 3a install. A consolidated Hotfix 2 → Hotfix 3b update is also provided so the complete Hotfix 3 + 3a + 3b sequence can still be deployed as one update.

## Upgrade from Hotfix 3a

1. Leave the Bot installation unchanged; Bot runtime remains `1.1.14-cloud-continuity-h3`.
2. Back up/commit the current Web repository.
3. Overlay the **Hotfix 3b Web Patch from Hotfix 3a** into the Web repository.
4. Keep all existing Render environment variables and OAuth settings unchanged.
5. Commit/push and let Render redeploy the Web service.
6. Verify `/api/health` reports runtime `1.1.14-cloud-continuity-h3` and frontend revision `1.1.14-continuity3b`.
7. Open **Moogle Emporium** and confirm equipment cards show **Stat boosts** plus the comparison against the currently equipped item or an empty-slot note.
8. Open **Jobs** and confirm the cards are compact again, with **View <Job> Details** available.
9. Open a Job detail pop-out and confirm Combat Identity, Stat Growth, Battle Abilities, Passive Job Milestones, and JLv.50 Mastery remain available.

No Bot redeploy, database migration, player reset, new Render secret, or OAuth reauthorization is required when upgrading from Hotfix 3a.

## Direct upgrade from Hotfix 2

Use the **Hotfix 3b Consolidated Update from Hotfix 2**. It contains the Hotfix 3 Bot/Raid/Rally/control fixes plus the final Hotfix 3b Web state, including the 3a Job-reference work and these 3b refinements. Apply that one package over Hotfix 2 instead of chaining separate Hotfix 3, 3a, and 3b packages.
