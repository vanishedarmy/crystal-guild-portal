# Crystal Guild v1.1.18 — Retro Phase 1 Release Notes

Retro Phase 1 is a **Web-only visual foundation release** built on **v1.1.17 — Arsenal II Hotfix 5**. It begins the planned SNES-era Final Fantasy-inspired graphical rollout without changing gameplay, player progression, Portal actions, database structure, or Twitch behavior.

## Shared retro visual foundation

- Replaces much of the previous glass-like presentation with crisp, layered **16-bit RPG menu-window framing**.
- Adds a restrained dark-blue / crystal-blue / silver / gold palette shared across the public Portal, character pages, Player Guide, and Streamer Dashboard.
- Uses stepped shadows, squared/chamfered geometry, inset frame lines, and subtle low-resolution background texture to create the retro character while keeping text readable.
- Preserves the existing Crystal Guild roundel and overall information architecture.

## Navigation and controls

- Active desktop navigation now reads more like a classic RPG menu selection, including a small diamond cursor cue.
- Tabs, filters, primary actions, authentication controls, and selected states receive brighter framed treatment with clearer focus contrast.
- Inputs, tables, progress bars, status chips, rarity badges, and dialogs now follow the same shared window language.

## Cards and information panels

- Guild Hero cards, profile panels, inventory/equipment cards, Hunt cards, achievement/title cards, records, dialogs, and Streamer Dashboard panels inherit the new retro frame system.
- Hover/focus feedback stays inside element bounds and avoids scale/translation effects that could cause clipping or motion noise.
- Existing spacing, ordering, responsive behavior, and action placement are intentionally retained.

## Player Guide

- The Guide receives its own matching Retro Phase 1 layer because its stylesheet loads independently from the main Portal bundle.
- Guide navigation, cards, command blocks, tables, dialogs, callouts, and catalog panels now visually align with the rest of the site.

## Mobile and accessibility

- The canonical mobile header remains unchanged in structure: **brand icon left, LIVE/OFFLINE status, hamburger page selection**.
- Retro framing is simplified on narrow screens to avoid consuming useful space.
- Existing focus-visible and reduced-motion behavior is preserved; Retro Phase 1 adds a high-contrast gold focus ring in the new theme layer.
- Body text remains modern/readable rather than being forced into a tiny decorative pixel font.

## Deliberately deferred to later Retro phases

Retro Phase 1 establishes the visual system only. It does **not** yet add page-specific sprite portraits, Job sprites, item/weapon icons, monster/boss artwork, region scenes, battle backdrops, or animated pixel effects. Those can be layered in gradually without destabilizing the shared UI foundation.

## Compatibility

- **Bot runtime:** `1.1.17-arsenal-ii-h4` unchanged
- **Hosted Web runtime:** `1.1.18-retro-phase-1`
- **Frontend asset revision:** `1.1.18-retro-phase1`
- **Local DB schema:** **5** unchanged
- **Hosted sync schema:** **1** unchanged
- **Portal Action protocol:** **14** unchanged
- **Twitch command prefix:** `!` unchanged

No database migration, player reset, OAuth change, new environment variable, or Bot redeploy is required.
