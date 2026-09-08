# Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 5

## Mobile UI/UX Cleanup — Retainer Service & Player Guide

### Retainer Service
- Mobile uses an **action-first order**: Current Assignment → Assignments → Retainer → History.
- A compact four-item jump bar links directly to Current, Assignments, Retainer, and History.
- Retainer status artwork is no longer absolutely overlaid on narrow screens; it occupies a bounded thumbnail column beside readable status copy.
- Procurement cards use a compact mobile image/content layout instead of tall full-width artwork cards.
- Priority selectors and primary Retainer actions meet mobile touch sizing, with 16px select text to avoid browser zoom-on-focus behavior.
- The Retainer profile becomes a short portrait + progression summary with its three lifetime statistics below it.
- The Retainer hero is reduced on narrow screens and decorative office artwork is removed on very small phones.
- Long history/reward copy remains wrap-safe and no horizontal overflow is introduced.

### Player Guide
- Added a **Jump to section** selector grouped by Begin, Adventure, Build Your Hero, Gear & Endgame, and Completion.
- Phone-sized layouts use **single-section accordion behavior**, preventing several enormous Guide sections from remaining open at once.
- Every expanded major section gains a **Back to guide index** control on mobile.
- Guide search now has an explicit **Clear** action and an `aria-live` result count.
- The mobile navigation drawer is removed from the tab order while closed, moves focus into the drawer when opened, traps Tab while active, and restores focus when dismissed.
- Current Guide navigation receives an active-state marker for assistive technology and visual orientation.
- Mobile hero/search/index spacing is reduced while preserving full Guide copy and existing responsive data-card behavior.
- Expand All remains available on desktop but is intentionally hidden on phone layouts; Collapse All remains available.

### Preserved Hotfix 5 behavior
- Rally/Stream Venture remains **100% Encounter / 0% Treasure Chest**.
- Solo Venture remains **80% Encounter / 20% Treasure**.
- Weapon + Armor Best use, ☆/★ Favorites, item-level sorting, and removal of `Replaces X` remain intact.
- The paired Bot includes the prior Solo Venture treasure → Treasure Seekers/Treasure Hunters progress correction.

Runtime/frontend remains `1.7.1-resynthesis-a2h5`; paired Bot remains `1.7.1-resynthesis-a2h5`; schema **15**; hosted sync **1**; Portal protocol **32**. No database migration or player reset.
