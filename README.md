# Crystal Guild v1.2.0 — Expeditions Alpha 3

Expeditions Alpha 3 adds the Expedition Atlas, repeatable Legendary Regional Contracts, and all-region Master Cartographer progression while retaining the complete Alpha 2 Hotfix 3 scenic presentation.

## RC1 Hotfix 9 — Raid Timing & Field Support
- Raid rally/round defaults are now **90s / 60s**; Rally Venture rally/round defaults are **60s / 30s**.
- Portal Adventure countdowns synchronize to Bot server time instead of the viewer device clock.
- Streamer Portal boss spawns publish the raid rally to Twitch while LIVE.
- The OBS overlay clears as soon as the raid snapshot becomes inactive, including after victory.
- Inventory & Recovery supports LIVE out-of-battle field-item targeting of another adventurer.
- Paired Web/Bot protocol advances to **19**; DB schema remains **7**.

## RC1 Hotfix 8 — Raid Overlay Visual Rework
- `/overlay` now uses a compact Final Fantasy-inspired raid HUD with a framed boss-art panel.
- Raid tier, living raiders, round, phase, exact HP, HP percentage, Summon gauge, and the top three damage leaders are visually separated for faster stream readability.
- Low boss HP, ENRAGED, VICTORY, and WIPE receive distinct treatments.
- The surrounding Browser Source remains transparent and the HUD continues to self-hide when raid state is missing or stale.
- This is a Web-only hotfix: Portal Action protocol remains 18 and the existing RC1H7 Bot remains compatible.

## Chocobo portraits
- Registered Chocobos can choose from 10 SNES/FF-style portrait options in the Chocobo Stable.
- Portrait choice is saved by the authoritative Bot through `SET_CHOCOBO_PORTRAIT`.
- The selected portrait is visible on both the owner Stable and read-only public Chocobo cards.
- Existing Chocobos migrate to Classic Gold automatically; Bond, traits, names, and progression are untouched.

## RC1 Hotfix 4 — Relic Refresh + Dynamic Camp
- All eight Relic weapon lines use the newly regenerated Tier 1 / Tier 2 / Tier 3 transparent PNG progression.
- Dedicated Relic art remains surfaced in the Relic Arsenal, Relic detail dialog, Trophy Hall, Player Guide Relic cards/dossiers, and shared item-art locations.
- Camp now uses a 15-minute base timer while Twitch is LIVE and a 1-hour base timer while OFFLINE; existing Fellowship Camp-time reductions remain in force.
- The Camp rule is authoritative in the paired RC1H4 Bot runtime, so deploy the Web and Bot updates together.

## Technical identity
- Hosted Web runtime: `1.2.0-expeditions-alpha3`
- Frontend asset revision: `1.2.0-expeditions-a3`
- Portal Action protocol: `20`
- Hosted sync schema: `1`
- Compatible Bot runtime: `1.2.0-expeditions-a3`
- Local Bot DB schema: `8`

## Facility supply balance
- **Ancient Coin** now appears on Ossuary Knight, Mimic, Magic Pot, and Ancient Mimic.
- **Hi-Potion** now appears on Goblin Chieftain, Mimic, and Tonberry, in addition to its existing crafting/shop acquisition routes.
- **Mythril Ore** now appears across Spriggan, Gigas, Mimic, Iron Giant, and Ancient Adamantoise.
- **Wyvern Scale** now appears across Cockatrice, Basilisk, Sea Serpent, Red Dragon, Blue Dragon, and Wyrm.
- **Elemental Crystal** now appears across early Flan/Bomb enemies and increasingly efficient crystal/elemental enemies later in progression.
- **Demon Horn** now begins with Imp and continues through progressively stronger demonic enemies instead of having no normal monster source.

The Player Guide Bestiary reads these percentages directly from `guide-data.json`, which is aligned to the paired authoritative Bot data for this release.

## Retro Phase III continuity
- All prior iii11 item/weapon artwork remains in place.
- Current material artwork coverage remains complete.
- No retired artwork path is restored by this balance checkpoint.

## RC1 Hotfix 7 — Streamer Inventory Admin
The authenticated Streamer Control Center now includes player inventory administration. The broadcaster can select a player, specify an exact item name/ID and quantity, then add or remove the stack through the Portal. Matching owner-only `!additem` / `!removeitem` Twitch commands use the same authoritative Bot path. Portal retries are replay-safe and all item deltas are written to the normal transaction ledger. Local DB schema remains 7; paired Web/Bot deployments use Portal Action protocol 18.

## RC1 Hotfix 6 — Persistent Adventure Results
The Streamer Dashboard remains in normal responsive page flow with owner-authenticated backend controls and LIVE-only notable Portal Solo/Hunt/Title announcements. Adventure Board Solo and timed Hunt result cards are now stored durably by the paired Bot and remain visible until the player explicitly selects **Confirm Result**. Deploy the matching Bot because DB schema 7 and Portal Action protocol 17 are required.
