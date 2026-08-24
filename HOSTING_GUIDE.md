# Crystal Guild Web Hosting — Arsenal Hotfix 5

The hosted Web runtime is `1.1.17-arsenal-ii` with frontend asset `1.1.17-arsenal-ii1h2`, paired with unchanged Bot runtime `1.1.17-arsenal-ii`. Hosted sync schema remains **1** and Portal Action protocol remains **14**.

Deploy the Web files to GitHub/Render as normal. No new environment variable, OAuth scope, database migration, or Bot restart is required.

Hotfix 5 specifically fixes `/api/actions/result` so legitimate authenticated Bot result envelopes above 16 KiB can be acknowledged while the stored result remains capped at 64 KiB.


> Current Web patch: **Arsenal II Hotfix 2** (`1.1.17-arsenal-ii1h2`). See `HOTFIX_2_UPGRADE_GUIDE.md` and `HOTFIX_2_RELEASE_NOTES.md`.
