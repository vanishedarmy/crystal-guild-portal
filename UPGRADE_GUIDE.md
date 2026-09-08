# Upgrade to v1.7.1 Resynthesis Alpha 2 Hotfix 5 — Mobile UI/UX Cleanup

If you already installed the **Treasure Seekers Solo Progress** Complete/Bot build, this update is **Web-only**. Deploy the new Web package or apply the incremental Web patch to that build's `web` tree.

For a clean replacement, use the new Complete archive; it contains the unchanged verified Treasure Seekers Bot plus the revised Web tree.

Preserve the live database, Twitch tokens, secrets, and persistent runtime files. No database migration is required: schema remains **15**, hosted sync **1**, Portal protocol **32**.

Guide assets use stable filenames but are served with revalidation; a normal reload should receive the new Guide CSS/markup. A hard refresh is only needed if an intermediary cache is unusually sticky.
