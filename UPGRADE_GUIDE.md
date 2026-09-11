# Upgrade — Mobile Control Fit Correction

This is a **Web-only** correction on top of **HTTP Response Efficiency**. If that Bot is already installed, do not replace it; deploy only the incremental Web patch or the full Web package.

Current contract remains runtime `1.7.1-resynthesis-a2h5`, schema **16**, hosted sync **1**, Portal Action protocol **33**, Twitch prefix `!`.

The patch changes only Web CSS, release metadata, and focused frontend regression coverage. Preserve hosted secrets and persistent runtime files as usual. No database migration, protocol change, environment-variable change, or player reset is performed.

For a clean replacement install, the Complete archive pairs the unchanged HTTP Response Efficiency Bot with the corrected Web tree.
