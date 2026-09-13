# Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 5 — Desktop Item Control Fit Correction

This Web-only correction addresses the oversized/squeezed item-use controls shown in the desktop Camp/Recovery and Solo Venture battle-inventory views while preserving the existing Crystal Guild theme.

## Camp / Recovery item controls
- Desktop Recovery commands use wider minimum card widths so item names such as Potion, Hi-Potion, Mega-Potion, and X-Potion do not break into awkward fragments.
- The item artwork is reduced from the previous 52px command footprint to a compact 40px presentation.
- Item name/effect copy and `Owned · Use` metadata now share a compact two-row command layout instead of fighting for three horizontal columns.
- Command height and padding are reduced while retaining the full clickable card and existing item artwork/theme.
- Mobile Recovery behavior is unchanged.

## Solo Venture / Dungeon battle inventory
- Battle **items only** use a denser desktop command presentation; Ability choices retain their existing layout.
- Item buttons reduce their previous 94px minimum height to a compact 70px desktop minimum.
- Large desktop widths use three battle-item commands per row instead of oversized two-column half-page panels.
- Name, quantity/target, Use state, and short effect context remain visible.
- Effect text is capped at two visible lines for consistent command height; the existing item title/tooltip still carries the complete description.
- Disabled/unusable item behavior is unchanged.

## Compatibility
The prior Mobile Control Fit Correction, HTTP Response Efficiency transport changes, Full Rest & Combat Continuity, authoritative cross-device Gear Favorites, Treasure Seekers, Rally 100/0, Solo 80/20, and current visual design remain unchanged.

Runtime remains `1.7.1-resynthesis-a2h5`; local schema **16**, hosted sync **1**, Portal protocol **33**. No migration or player reset.
