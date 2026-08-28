# Upgrade Guide — v1.2.0 Expeditions Alpha 2

Baseline: **Alpha 1 Hotfix 3 Web + Alpha 1 Hotfix 1 Bot**.

Deploy the matching Alpha 2 Web and Bot packages together. The protocol number remains 20, but Alpha 2 adds the new `boss` Expedition depth and Region Progress payload/UI semantics.

No database migration, OAuth change, environment-variable change, or player reset is required. Existing Expedition progress is preserved. After deployment, hard-refresh the Portal once so frontend revision `1.2.0-expeditions-a2` is loaded.
