# Portal Actions — v1.4.0 Dungeons & Delves Alpha 4

Portal Action protocol remains **24** from Alpha 3. Alpha 4 reuses the existing Dungeon action contract, including `DUNGEON_CHOICE`; weighted Event chambers resolve authoritatively during normal room progression and do not add a new Portal action type.

Dungeon mutations remain authoritative on the Bot, replay-safe, and bound to the exact active run/chamber shown by the submitting browser tab. Deploy matching Alpha 4 Web and Bot so both sides share the same Dungeon catalog and encounter presentation.
