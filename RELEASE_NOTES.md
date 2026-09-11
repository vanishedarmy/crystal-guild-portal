# Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 5 — Mobile Control Fit Correction

This Web-focused correction fixes the mobile control-placement problems visible in the Gold Saucer, active combat, Jobs, Hunts, Daily Guild Provisions, and Blacksmith while preserving the existing reverted visual design and HTTP Response Efficiency work.

## Root cause fixed
An Equipment Favorites media rule accidentally targeted every `.equipment-action-button` at mobile widths instead of only Equipment-card actions. The leaked `grid-column: 2` declaration could create an implicit empty first column anywhere those buttons appeared, producing the detached right-side button stacks shown on mobile.

The selector is now scoped to `.equipment-card-actions .equipment-action-button` only.

## Focused mobile layout corrections
- Mini Cactpot payout choices use a compact two-column decision grid; only extremely narrow screens collapse to one column.
- Dungeon/Solo combat command bars use a balanced 2×2 action grid on normal phone widths.
- Ability/Item picker Close controls remain attached to the picker heading instead of reading like another primary full-width action.
- Job cards keep portrait/identity content together and place View/Switch actions in one intentional row when space permits; very narrow phones fall back to one column.
- Hunt cards keep the clear/availability badge aligned with the Hunt identity and give Dispatch a deliberate full-width footer action.
- Daily Guild Provisions places claim/status and Refresh together in a clean two-button action row, falling back to one column on narrow phones.
- Blacksmith service tabs occupy their own full-width band; Search and Refresh sit beneath them instead of competing for the same horizontal space. Very narrow phones use a 2+1 tab arrangement so `Resynthesize Gear` is never crushed into a narrow column.

## Compatibility
HTTP Response Efficiency remains intact: SSE-first refresh, conditional ETags/304, long-poll Portal action delivery, reduced fallback polling, and manifest-first sync heartbeats are unchanged. Full Rest & Combat Continuity, authoritative cross-device Gear Favorites, Treasure Seekers, Rally 100/0, Solo 80/20, and the reverted visual design remain intact.

Runtime remains `1.7.1-resynthesis-a2h5`; local schema **16**, hosted sync **1**, Portal protocol **33**. No migration or player reset.
