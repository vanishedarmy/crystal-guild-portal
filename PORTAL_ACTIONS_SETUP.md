# Portal Actions Setup — Arsenal Hotfix 4

Portal Action protocol remains **14**. Deploy Web runtime `1.1.16-arsenal-h4` with Bot runtime `1.1.16-arsenal-h4`. Hosted sync schema remains **1**, compatibility remains `1.1.15-wayfarer`, and no new Render secret is required.

Hotfix 4 adds no new player-facing Portal mutation. The new `!clearadventures` recovery path is streamer-only and executes directly in the authoritative Bot. Existing Hotfix 3 Portal result-size and retry protections remain unchanged.
