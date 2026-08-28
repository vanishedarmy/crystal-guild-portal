# Portal Actions Setup — RC1 Hotfix 9

Portal Action protocol is **19**. Deploy Web runtime `1.1.19-retro-phase-iii-rc1h9` together with Bot runtime `1.1.19-retro-phase-iii-rc1h9`. Hosted sync schema remains **1** and local DB schema remains **7**.

Existing Portal relay secrets, Twitch OAuth configuration, numeric Twitch identity binding, lease/idempotency behavior, and CSRF protections are unchanged. No new secret is required.

H9 extends `USE_FIELD_ITEM` with an optional sanitized target Twitch username and keeps Streamer Portal `spawnboss` owner-only. The Bot independently verifies LIVE state before cross-player field support or Portal-origin raid-rally chat output.
