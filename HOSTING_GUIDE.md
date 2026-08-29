# Crystal Guild v1.3.0 Guild Expansion — Hosting Guide

Deploy this final Web package together with the matching v1.3.0 Guild Expansion Bot. Preserve the existing hosted environment variables, persistent storage, Twitch/OAuth settings, and portal sync key.

The hosted runtime and frontend revision are both `1.3.0-guild-expansion`. Local DB schema remains **9**, hosted sync schema **1**, and Portal Action protocol **22**.

After deployment, hard-refresh the site once and verify `/api/health`, the Fellowship page, current Guild project, Airship state, Guild Legacy, Founding Hall scene, and collapsible Equipment & Inventory groups.
