# Crystal Guild v1.4.0 Dungeons & Delves Alpha 1 — Hosting Guide

Deploy this Web package together with the matching `1.4.0-dungeons-a1` Bot. Preserve all existing environment variables, persistent storage, Twitch/OAuth settings, and Portal sync key.

Hosted runtime/frontend revision: `1.4.0-dungeons-a1`. Local DB schema **10**, hosted sync schema **1**, Portal Action protocol **23**.

The local Bot performs the additive schema-9 → schema-10 migration on startup. The hosted Web database schema remains unchanged.
