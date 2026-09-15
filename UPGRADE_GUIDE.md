# Upgrade Guide — Mobile Help & Disclosure Alignment

This is a **Web-only** correction on top of **Personalized Chat Results + Raid XP Boost**.

If that build is already installed, deploy the incremental Web patch only. The Bot does not need to change.

The update changes only mobile control-fit CSS, focused frontend regression coverage, and release metadata. It does not modify gameplay, Raid XP, Twitch settlement behavior, authoritative player state, database schema, hosted sync, or Portal actions.

Release contract:
- runtime/frontend `1.7.1-resynthesis-a2h5`
- local DB schema **16**
- hosted sync schema **1**
- Portal Action protocol **33**
- database migration: **none**
- player reset: **none**

For a clean replacement, use the Full Web package or Complete package while preserving live databases, secrets, tokens, and persistent runtime state as usual.
