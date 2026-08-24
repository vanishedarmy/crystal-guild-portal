CRYSTAL GUILD WEB v1.1.16 — ARSENAL HOTFIX 5
=============================================

Upgrade baseline: v1.1.16 — Arsenal Hotfix 4

Hosted result-acknowledgement fix:
- `/api/actions/result` now accepts the bounded authenticated Bot result envelope needed for large Arsenal Adventure Board state;
- browser/action claims remain capped at 16 KiB;
- stored action results remain capped at 64 KiB;
- fixes repeated HTTP 400 `Request payload size is invalid.` worker errors.

Bot runtime: 1.1.16-arsenal-h4 (unchanged)
Web runtime: 1.1.16-arsenal-h5
Frontend: 1.1.16-arsenal1h5
Local DB schema: 5 (unchanged)
Hosted sync schema: 1 (unchanged)
Portal Action protocol: 14 (unchanged)
