# Crystal Guild — Unified PC/Mobile UI/UX + SNES FF Audit

## Decision

**PASS — the Portal now resolves through one final responsive visual system instead of relying on accumulated page-specific overrides.**

This pass is presentation-only. It does not alter gameplay, economy, progression, encounter logic, authoritative Favorites behavior, database schema, hosted sync, or Portal action semantics.

## Audit scope

The pass reviewed and normalized the shared shell/header, Guild Heroes directory, player masthead and tab navigation, Overview/status blocks, Adventure Board, Rally/Solo Venture, Hunts, Dungeons, Expeditions, Trials/Raids, Jobs, Equipment, Inventory/Recovery, Moogle Emporium, Blacksmith, Chocobo/Stables, Retainer Service, Fellowship/Guild, Gold Saucer, Achievements/Titles, Records/Trophy Hall, Bestiary/boss presentation, Streamer Dashboard, item/detail dialogs, tables, and Player Guide.

## Desktop / wide-screen rules

- Content is bounded to a consistent readable maximum width with shared gutters, panel gaps, and card gaps.
- Player identity preserves the intended three-part portrait → identity → vitals composition; Job artwork remains uncropped at its native 3:4 layout.
- Dense grids use consistent minimum card widths so cards do not collapse into tall narrow columns.
- Tab/filter controls remain compact and do not force unnecessary wrapping.
- Primary actions use a consistent height and visual hierarchy; heading controls remain compact instead of inflating section headers.
- Scenic artwork is treated as supporting visual material rather than a layout driver.

## Mobile / touch rules

- A single compact masthead is retained, with touch-safe controls.
- Player identity condenses to portrait + identity followed by full-width vitals; the portrait remains 3:4 and uses `object-fit: contain`.
- Major card grids collapse to one column before content becomes squeezed.
- Small stat grids use two columns where useful and one column on very narrow phones.
- Card actions become predictable full-width touch targets, while star/collapse/heading actions stay compact.
- Equipment Favorites retain the icon-only ☆/★ control beside the primary equipment action.
- Long tab/filter sets become horizontal touch rails rather than wrapped multi-row button walls.
- Retainer keeps the action-first mobile order and reduces portrait/assignment art to subordinate, bounded thumbnails.
- Raid, Dungeon, Expedition, Hunt, and scenic art is bounded/dimmed so imagery cannot displace essential controls.
- Tables scroll horizontally inside their own viewport; dialogs are bounded to the device viewport.
- Short landscape touch devices receive a separate compact profile composition.

## SNES / FF visual pass

- Primary windows now share a crisp dark-blue FF-style gradient, double-edge inset treatment, and deliberately square 4px window geometry.
- Cards use a lighter secondary window treatment so nested content remains readable without excessive borders.
- Controls use compact 3px geometry, consistent blue/gold hierarchy, and pixel-like offset shadows rather than soft modern glass effects.
- Backdrop blur is removed from primary windows to keep the presentation closer to the SNES-era menu language.
- Existing Cinzel display typography, pixel assets, pointer-hand controls, and SNES/FF6 artwork direction are preserved.

## Player Guide

The Guide receives the same final window/control geometry, denser desktop hero spacing, mobile section/card collapse rules, touch rails for long navigation groups, viewport-safe tables/detail overlays, and tighter mobile section rhythm. Existing accessible mobile drawer behavior and direct section navigation remain intact.

## Regression contract

- Runtime/frontend: `1.7.1-resynthesis-a2h5`
- Local DB schema: **16**
- Hosted sync schema: **1**
- Portal Action protocol: **33**
- Twitch command prefix: `!`
- No database migration for this UI pass.
- No player reset.
