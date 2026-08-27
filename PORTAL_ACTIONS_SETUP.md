# Portal Actions Setup — RC1 Hotfix 7

Portal Action protocol is **18**. Deploy Web runtime `1.1.19-retro-phase-iii-rc1h7` with the paired Bot runtime `1.1.19-retro-phase-iii-rc1h7`. Hosted sync schema remains **1** and local DB schema remains **7**.

Hotfix 7 extends the existing strict `STREAMER_COMMAND` allowlist with `additem` and `removeitem`. The Web validates `player | item | quantity`, confirms the signed-in account is the broadcaster supplied by the Bot manifest, and queues only the typed allow-listed owner action. The Bot checks `TWITCH_OWNER_ID` again before executing the inventory mutation. No arbitrary command relay is accepted.

Hotfix 6 `ACK_ADVENTURE_RESULT` confirmation remains unchanged.
