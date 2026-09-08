# Upgrade to v1.7.1 Resynthesis Alpha 2 Hotfix 5 — final UI corrections

If you already run the prior Hotfix 5 Bot, update the **Web package only**. The Bot runtime and gameplay contract are unchanged.

Preserve the live database, token storage, persistent files, and secrets. No database migration is required: schema remains **15**, hosted sync **1**, Portal protocol **32**. Gear Favorites remain browser-local and do not alter player data.

After deployment, hard-refresh the Portal if a browser still shows the previous gear-card layout.
