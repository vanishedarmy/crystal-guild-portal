# Upgrade to v1.7.0 — Final Hardening & Performance Hotfix 5

This is a **Web-only** update from UI Compactness Hotfix 4.

1. Keep the existing `1.7.0-emporium-annex-a3h3` Cloud Storage Hotfix 3 Bot.
2. Replace/deploy the Web source with Hotfix 5 (`1.7.0-emporium-annex-a3h5`).
3. Preserve hosted secrets, persistent state, and the live database.
4. Do not reset player data or rerun any schema migration manually.

No schema migration or Portal protocol change is required.
