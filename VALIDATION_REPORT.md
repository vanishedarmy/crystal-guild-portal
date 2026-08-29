# Validation Report — Crystal Guild v1.2.0 Expeditions Beta 2 Hotfix 1

## Result
**PASS — current-viewport detail-card positioning hotfix validated.**

## Automated validation
- Frontend Node regression suite: **314 / 314 PASS**.
- Hosted Web/API Python suite: **47 / 47 PASS**.
- Compatible Beta 1 Bot suite: **437 / 437 PASS**.
- Python compilation: **PASS**.
- Focused current-viewport dialog regression: **PASS**.

## Hotfix coverage
- Detail dialogs are explicitly `position: fixed` in the final imported style layer.
- Desktop detail dialogs center inside the visible viewport rather than document layout.
- Narrow/mobile detail dialogs open as a bottom sheet inside the current viewport.
- Beta 2 viewport capture/restore and `preventScroll` focus restoration remain intact.
- Beta 2 Adventure Board hierarchy, anchored collapsibles, Atlas preference, Player Guide catalog behavior, and Beta 1 gameplay balance remain unchanged.

## Patch / package validation
- Beta 2 → Beta 2 Hotfix 1 Web patch contains **16 changed/new files, 0 deletions**.
- Applying the patch to a clean Beta 2 Web tree reproduces the final Hotfix 1 tree exactly across **785 files**.
- ZIP integrity: **PASS**.
- Runtime/secret hygiene: **PASS**; no live `.env`, token stores, SQLite runtime files, logs, bytecode, or cache directories are packaged.

## Compatibility
- Public product: **v1.2.0 — Expeditions Beta 2**
- Hosted Web runtime: `1.2.0-expeditions-beta2`
- Frontend asset revision: `1.2.0-expeditions-b2h1`
- Compatible Bot runtime: `1.2.0-expeditions-b1`
- Local DB schema: **8**
- Hosted sync schema: **1**
- Portal Action protocol: **20**
- Migration/player reset: **none**
