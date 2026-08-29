# Crystal Guild v1.3.0 Guild Expansion Alpha 4 — Hosting Guide

Deploy the Alpha 4 Web package normally using the existing Render configuration. Deploy the matching Alpha 4 Bot so the local schema-9 Airship state is published to the hosted Fellowship snapshot.

After deployment, `/api/health` should report Web runtime/frontend revision `1.3.0-guild-expansion-a4`, hosted sync schema **1**, and Portal Action protocol **21**.

The paired Bot should report runtime `1.3.0-guild-expansion-a4`, local DB schema **9**, hosted sync schema **1**, and Portal Action protocol **21**. Preserve existing environment values, database files, Twitch credentials, and persistent storage paths. No new environment variables are required.
