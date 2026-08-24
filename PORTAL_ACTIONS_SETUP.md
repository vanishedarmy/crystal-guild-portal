# Portal Actions Setup — Arsenal Hotfix 5

Portal Action protocol remains **14**. Deploy Web runtime `1.1.18-retro-phase-1` with unchanged Bot runtime `1.1.17-arsenal-ii-h4`. Hosted sync schema remains **1** and no new Render secret is required.

Security bounds are split by direction:
- normal browser/action request and Bot claim request: 16 KiB maximum;
- authenticated Bot result HTTP envelope: 68 KiB maximum;
- stored authoritative action result: 64 KiB maximum.

This prevents Arsenal's larger Adventure Board state from failing acknowledgement without relaxing ordinary player request limits.
