# Crystal Guild v1.3.0 Guild Expansion Alpha 2 — Hosting Guide

Deploy the Web package normally using the existing Render configuration.

After deployment, `/api/health` should report Web runtime/frontend revision `1.3.0-guild-expansion-a2`, hosted sync schema **1**, and Portal Action protocol **20**.

The paired Bot should report runtime `1.3.0-guild-expansion-a2`, local DB schema **8**, hosted sync schema **1**, and Portal Action protocol **20**. Preserve the current environment values, database, Twitch credentials, and persistent storage paths.
