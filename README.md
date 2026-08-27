# Crystal Guild v1.1.19 — Retro Phase III / Release Candidate 1

RC1 finalizes the Retro Phase III Web presentation while retaining Chocobo portraits, Facility Supply Balance, and the completed artwork catalog. It adds scenic backgrounds to Camp/Recovery, Blacksmith, Chocobo Stable, and Moogle Emporium, plus a final routing/cleanup audit.

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
- Hosted Web runtime: `1.1.19-retro-phase-iii-rc1h6`
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1h6`
- Portal Action protocol: `17`
- Hosted sync schema: `1`
- Paired Bot runtime: `1.1.19-retro-phase-iii-rc1h6`
- Local Bot DB schema: `7`

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

## RC1 Hotfix 6 — Persistent Adventure Results
The Streamer Dashboard remains in normal responsive page flow with owner-authenticated backend controls and LIVE-only notable Portal Solo/Hunt/Title announcements. Adventure Board Solo and timed Hunt result cards are now stored durably by the paired Bot and remain visible until the player explicitly selects **Confirm Result**. Deploy the matching Bot because DB schema 7 and Portal Action protocol 17 are required.
