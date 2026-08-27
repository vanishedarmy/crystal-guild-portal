# Portal Actions Setup — RC1 Hotfix 6

Portal Action protocol is **17**. Deploy Web runtime `1.1.19-retro-phase-iii-rc1h6` with the paired Bot runtime `1.1.19-retro-phase-iii-rc1h6`. Hosted sync schema remains **1**.

Hotfix 6 adds the typed `ACK_ADVENTURE_RESULT` action used by the Adventure Board's **Confirm Result** controls. The hosted Web validates a numeric result ID, the authoritative Bot verifies the signed-in Twitch player owns that pending result, and only that row is acknowledged.

Hotfix 5's typed owner-only `STREAMER_COMMAND` action remains available. The hosted Web learns the broadcaster Twitch ID from the authenticated Bot manifest, and the Bot revalidates that identity before any owner action executes. Arbitrary command strings are rejected; no new Web-side owner secret or Render environment variable is required.
