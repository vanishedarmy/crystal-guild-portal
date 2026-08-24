# Portal Actions Setup — Arsenal Hotfix 3

Portal Action protocol remains **14**. Deploy Web runtime `1.1.16-arsenal-h3` with the existing `1.1.16-arsenal-h1` Bot. Hosted sync schema remains **1**, compatibility remains `1.1.15-wayfarer`, and no new Render secret is required.

Hotfix 3 keeps the Hotfix 2 queue scheduling changes and additionally fixes Adventure Board result delivery: read-only state requests coalesce and do not consume the mutation queue budget; identical in-flight Daily/Solo/Hunt requests are reused; gameplay mutations are claimed before ordinary state refreshes.
