# Crystal Guild v1.3.1 Asset Optimization — Hosting Guide

Deploy this Web package together with the matching v1.3.1 Asset Optimization Bot. Preserve the existing hosted environment variables, persistent storage, Twitch/OAuth settings, and portal sync key.

The hosted runtime remains `1.3.1-asset-optimization`; the frontend asset revision is `1.3.1-asset-optimization-ui1`. Local DB schema remains **9**, hosted sync schema **1**, and Portal Action protocol **22**.

After deployment, hard-refresh the site once and verify `/api/health`, the Fellowship page, current Guild project, Airship state, Guild Legacy, Founding Hall scene, and collapsible Equipment & Inventory groups.
