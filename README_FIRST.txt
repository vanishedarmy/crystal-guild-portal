CRYSTAL GUILD v1.1.16 — ARSENAL HOTFIX 3
========================================

Upgrade baseline: v1.1.16 — Arsenal Hotfix 2

Web-only Solo Venture state-delivery fix:
- keeps browser action requests capped at 16 KiB;
- raises the separately bounded authoritative Bot-result allowance to 64 KiB;
- restores expanded Adventure Board/Solo Venture state that could previously exceed the old result ceiling;
- retries the initial Adventure Board state every five seconds until authoritative state arrives;
- shows CHECKING instead of a false READY card while state is unavailable.

Bot runtime: 1.1.16-arsenal-h1 (unchanged)
Web runtime: 1.1.16-arsenal-h3
Frontend: 1.1.16-arsenal1h3
Local DB schema: 5 (unchanged)
Hosted sync schema: 1 (unchanged)
Portal Action protocol: 14 (unchanged)

No Bot replacement/restart, database migration, player reset, new Render secret, or OAuth change is required.
Deploy the Web files to GitHub/Render as usual, then refresh any already-open Portal tab once.
