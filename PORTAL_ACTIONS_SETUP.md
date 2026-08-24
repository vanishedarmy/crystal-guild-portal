# Portal Actions Setup — Arsenal Hotfix 2

Portal Action protocol remains **14**. Deploy Web runtime `1.1.16-arsenal-h2` with the existing `1.1.16-arsenal-h1` Bot. Hosted sync schema remains **1**, compatibility remains `1.1.15-wayfarer`, and no new Render secret is required.

Hotfix 2 changes relay scheduling only: read-only state requests coalesce and do not consume the mutation queue budget; identical in-flight Daily/Solo/Hunt requests are reused; gameplay mutations are claimed before ordinary state refreshes.
