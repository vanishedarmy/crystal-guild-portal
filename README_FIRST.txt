CRYSTAL GUILD v1.1.16 — ARSENAL HOTFIX 2
========================================

Upgrade baseline: v1.1.16 — Arsenal Hotfix 1

Web-only recovery hotfix:
- Daily Guild Provisions retries reuse one outstanding request instead of flooding the queue;
- duplicate read-state refreshes are coalesced automatically;
- state reads no longer consume the gameplay-action queue budget;
- gameplay actions are prioritized ahead of page refresh requests;
- active Solo Ventures poll authoritatively and delayed actions can be retried safely without duplicating a round.

Bot runtime: 1.1.16-arsenal-h1 (unchanged)
Web runtime: 1.1.16-arsenal-h2
Frontend: 1.1.16-arsenal1h2
Local DB schema: 5 (unchanged)
Hosted sync schema: 1 (unchanged)
Portal Action protocol: 14 (unchanged)

No Bot replacement/restart, database migration, player reset, new Render secret, or OAuth change is required.
Deploy the Web files to GitHub/Render as usual.
