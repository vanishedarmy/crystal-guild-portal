# Upgrade Guide — v1.5.1 Relic Artwork Refresh Web Hotfix 1

Supported baseline: **v1.5.1 — Relic Arsenal Complete Web**.

1. Preserve your deployment secrets/environment as usual.
2. Extract the patch package.
3. From the extracted package, run `python web_patch/apply_patch.py <target-web-root>`.
4. Rebuild/redeploy the hosted Web service.
5. Hard-refresh once, then open Relics and verify Dormant/Awakened/Zenith artwork for several Jobs.

No Bot update, database migration, player reset, OAuth reauthorization, or new environment variable is required.
