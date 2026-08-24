# Crystal Guild v1.1.17 — Arsenal II Hotfix 3 Upgrade Guide

Upgrade baseline: **v1.1.17 — Arsenal II Hotfix 2**.

1. Preserve your normal hosted environment variables and private/runtime state.
2. Apply the Hotfix 3 Web patch over the current Hotfix 2 Web source, or replace the Web source with the full Hotfix 3 Web package.
3. Push/deploy the updated Web source. No Bot files need to change.
4. Verify `/api/health` still reports runtime `1.1.17-arsenal-ii` and frontend revision `1.1.17-arsenal-ii1h3`.
5. Open Adventure Board at desktop width and confirm every region Travel button is the same width/height and shares a common bottom baseline.
6. Check a narrow/mobile view and confirm the cards remain single-column, full-width, and naturally sized.

No schema migration or player reset is required.
