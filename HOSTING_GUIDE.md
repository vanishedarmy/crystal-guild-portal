# Crystal Guild v1.3.0 Guild Expansion Alpha 3 — Hosting Guide

Deploy the Web package normally using the existing Render configuration.

After deployment, `/api/health` should report Web runtime/frontend revision `1.3.0-guild-expansion-a3`, hosted sync schema **1**, and Portal Action protocol **21**.

The paired Bot should report runtime `1.3.0-guild-expansion-a3`, local DB schema **8**, hosted sync schema **1**, and Portal Action protocol **21**. Preserve the current environment values, database, Twitch credentials, and persistent storage paths.
