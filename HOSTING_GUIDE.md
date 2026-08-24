# Crystal Guild Web Hosting — Arsenal Hotfix 2

Deploy the Web repository to Render as usual. Hotfix 2 uses hosted sync schema **1**, sync compatibility `1.1.15-wayfarer`, and Portal Action protocol **14**.

The hosted Web runtime is `1.1.16-arsenal-h2` with frontend asset `1.1.16-arsenal1h2`; it is intentionally compatible with the unchanged `1.1.16-arsenal-h1` Bot. No new Web secret or OAuth scope is introduced.

The hosted action relay now coalesces repeated state refreshes and prioritizes gameplay mutations so stale page polling cannot starve Solo Venture or Daily actions.
