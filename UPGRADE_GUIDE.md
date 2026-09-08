# Upgrade to v1.7.1 Resynthesis Alpha 2 Hotfix 5 — Player Guide Mobile Top Cleanup

If you already installed the **Mobile UI/UX Cleanup** build, this revision is **Web-only**. Deploy the revised Web package or apply the incremental Web patch to that build's Web tree.

For a clean replacement, use the refreshed Complete archive. It contains the same byte-identical verified Treasure Seekers Bot plus the revised Web tree.

Preserve the live database, Twitch tokens, secrets, and persistent runtime files. No database migration is required: schema remains **15**, hosted sync **1**, Portal protocol **32**.

Guide assets use stable filenames with the existing asset revision/revalidation behavior. A normal reload should receive the revised Guide markup/CSS; use a hard refresh only if an intermediary browser/CDN cache is unusually persistent.
