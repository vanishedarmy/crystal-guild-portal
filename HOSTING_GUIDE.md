# Crystal Guild v1.3.0 Guild Expansion Alpha 5 — Hosting Guide

Deploy the Alpha 5 Web and matching Alpha 5 Bot using the existing Render/local Bot configuration.

Alpha 5 keeps the Alpha 4 Airship database layout unchanged at local schema **9** and Portal Action protocol **21**. There is no database migration for Alpha 5. Existing Airship state, facility progress, Guild projects, player progression, and Fellowship history remain intact.

After deployment, `/api/health` should report Web runtime/frontend revision `1.3.0-guild-expansion-a5`, hosted sync schema **1**, and Portal Action protocol **21**.

The paired Bot should report runtime `1.3.0-guild-expansion-a5`, local DB schema **9**, hosted sync schema **1**, and Portal Action protocol **21**.

On first Alpha 5 startup, the Guild Legacy system evaluates the Guild's existing history. Any Legacy accomplishments already earned are recognized once through the normal Fellowship reward ledger; nothing is reset or re-earned on later restarts.

Preserve the existing environment values, database files, Twitch credentials, and persistent storage paths. No new environment variables, OAuth changes, or player reset are required.
