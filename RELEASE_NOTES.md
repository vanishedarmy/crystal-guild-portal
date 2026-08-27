# Crystal Guild v1.1.19 Retro Phase III RC1 Hotfix 7 — Streamer Inventory Admin

## Streamer inventory controls
- Adds **Player Inventory** to the authenticated Streamer Control Center.
- Select a registered adventurer, enter/select an exact item name or ID, choose quantity 1–999, then use **Add Item** or **Remove Item**.
- Remove Item is treated as a force action and requires the existing second-click confirmation.
- The item selector is backed by the public Guide catalog but still accepts exact item IDs/names manually.
- All adjustments are written to the normal item transaction ledger so Streamer activity remains auditable.

## Owner-only chat commands
- `!additem <player> | <item> | [quantity]` (alias `!giveitem`)
- `!removeitem <player> | <item> | [quantity]` (alias `!takeitem`)
- Exact Twitch username is recommended for the player field; exact item name or item ID is accepted.
- Removing more than the player owns is rejected rather than silently clamped.
- Removing the final copy of currently equipped gear automatically unequips that slot and normalizes character resources.

## Safety / authority
- Web authorization still verifies the broadcaster account from the signed Bot manifest.
- The Bot independently verifies `TWITCH_OWNER_ID`; the public Web cannot execute these actions for non-streamers.
- Portal item adjustments are replay-safe: the inventory mutation and Portal replay record commit atomically, preventing duplicate grants/removals after an acknowledgement retry.
- No arbitrary chat-command relay was added.

## Compatibility
- Web runtime: `1.1.19-retro-phase-iii-rc1h7`
- Frontend asset revision: `1.1.19-retro-phase-iii14-rc1h7`
- Bot runtime: `1.1.19-retro-phase-iii-rc1h7`
- Local DB schema: **7** (unchanged)
- Hosted sync schema: **1** (unchanged)
- Portal Action protocol: **18**
- Twitch prefix: `!`
