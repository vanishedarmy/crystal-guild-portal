# Upgrade — Battle Item Purpose Sort

This is a **Web-only** correction on top of **Desktop Item Control Fit Correction**. If that build and the current schema-16/protocol-33 Bot are already installed, deploy only the incremental Web patch or replace the Web tree with the full Web package.

Current contract remains runtime `1.7.1-resynthesis-a2h5`, schema **16**, hosted sync **1**, Portal Action protocol **33**, Twitch prefix `!`.

The update changes only battle-inventory presentation ordering, shared frontend sorting utilities, focused regression coverage, and release metadata. It does not alter inventory quantities, item effects, action resolution, encounter logic, HTTP transport, database state, environment variables, or Bot code.

Preserve hosted secrets and persistent runtime files as usual. No database migration, protocol change, or player reset is performed.
