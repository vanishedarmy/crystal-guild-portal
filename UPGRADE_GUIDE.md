# Upgrade Guide — v1.1.16 Arsenal Hotfix 2 → Hotfix 3

Hotfix 3 is Web-only.

1. Keep the existing `1.1.16-arsenal-h1` Bot running; no Bot files or database migration are required.
2. Apply the Hotfix 2 → Hotfix 3 Web patch to the Web repository, or replace the Web tree with the full Hotfix 3 Web package.
3. Commit/push the Web changes to GitHub and redeploy Render as usual.
4. Verify `/api/health` reports:
   - Web runtime `1.1.16-arsenal-h3`
   - frontend asset revision `1.1.16-arsenal1h3`
   - hosted sync schema 1
   - Portal Action protocol 14
5. Refresh any already-open Adventurer Portal tab once so it loads the Hotfix 3 frontend.
6. Reopen Adventure Board. If a Solo Venture was already persisted, the card should show **Checking your venture…** briefly and then restore the active stage instead of appearing as an empty READY card.

Existing queued Adventure Board requests are safe to resume. If one was already leased when the Web redeploy occurred, the existing Bot can retry/complete it under the corrected result-size allowance after the lease is reclaimed.
