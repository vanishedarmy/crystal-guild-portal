# Crystal Guild Web Hosting — Arsenal Hotfix 3

Deploy the Web repository to Render as usual. Hotfix 3 uses hosted sync schema **1**, sync compatibility `1.1.15-wayfarer`, and Portal Action protocol **14**.

The hosted Web runtime is `1.1.16-arsenal-h3` with frontend asset `1.1.16-arsenal1h3`; it is intentionally compatible with the unchanged `1.1.16-arsenal-h1` Bot. No new Web secret or OAuth scope is introduced.

The hosted action relay now coalesces repeated state refreshes and prioritizes gameplay mutations so stale page polling cannot starve Solo Venture or Daily actions.


Hotfix 3 separates the 16 KiB browser action-payload ceiling from a 64 KiB authoritative Bot-result ceiling so expanded Adventure Board state can complete safely.
