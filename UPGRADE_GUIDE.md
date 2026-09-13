# Upgrade — Desktop Item Control Fit Correction

This is a **Web-only** correction on top of **Mobile Control Fit Correction**. If that build (or its unchanged HTTP Response Efficiency Bot) is already installed, deploy only the incremental Web patch or replace the Web tree with the full Web package.

Current contract remains runtime `1.7.1-resynthesis-a2h5`, schema **16**, hosted sync **1**, Portal Action protocol **33**, Twitch prefix `!`.

The correction changes Web CSS, release metadata, and focused frontend regression coverage only. It does not change item effects, battle actions, database state, Portal transport behavior, environment variables, or Bot code.

Preserve hosted secrets and persistent runtime files as usual. No database migration, protocol change, or player reset is performed.

For a clean replacement install, the Complete archive pairs the unchanged Mobile Control Fit / HTTP Response Efficiency Bot with the corrected Web tree.
