# Crystal Guild Portal — Hosting Guide (Alpha 8)

Deploy this Web package alongside the matching Alpha 8 Bot: runtime/frontend `1.9.0-seasonal-events-alpha8`, Bot database schema **21**, hosted sync **1**, Portal Action protocol **37**. The hosted Web has no separate database schema migration for this cleanup.

Preserve OAuth/session configuration, private `PORTAL_SYNC_KEY`, public URL and persistent player data. Do not publish `.env`, database files, Twitch tokens or live player state in `frontend/public`. From `frontend/`, install the pinned package dependencies and run the normal Vite build.

On an existing Alpha 8 deployment, the cleanup patch needs no restart-time migration, but **you must delete the retired files listed in its deletion manifest** if overlaying in place. A fresh Complete/Web extraction already excludes them.

The Halloween edition is installed disabled by default.
