# Upgrade Guide — Gold Saucer Alpha 2 Web

Baseline: **v1.6.0 Gold Saucer Alpha 1 Hotfix 2 Web**.

Apply the H2 → Alpha 2 Web patch from the Web project root or replace with the full Alpha 2 Web tree, then rebuild/redeploy. Deploy the matching Alpha 2 Bot because Portal Action protocol advances to **27** and Monster Toss is Bot-authoritative.

Local DB schema advances **11 → 12** in the Bot only. Hosted sync remains **1**. Preserve hosted secrets and environment values; no new variable is required.
