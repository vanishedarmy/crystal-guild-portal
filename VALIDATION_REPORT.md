# Validation Report — Crystal Guild v1.7.0 — Retainer Service Alpha 2 Mobile Visual Pass Hotfix 3

**Result: PASS**

## Release contract

- Runtime: `1.7.0-retainer-a2`
- Frontend asset revision: `1.7.0-retainer-a2h3`
- Local DB schema: **15**
- Hosted sync schema: **1**
- Portal Action protocol: **31**
- Twitch command prefix: `!`
- Baseline: Retainer Service Alpha 2 Artwork & UI Hotfix 2
- Scope: **Web-only selective responsive UI correction**

## Gold Saucer corrective checks

- The hero no longer uses an unbounded `auto` balance column.
- Desktop/intermediate widths use `minmax(0,1fr) minmax(220px,360px)` so the title/intro copy retains usable width.
- The Current Balance card is capped at 360 CSS px on the two-column layout.
- The long MGP explanatory note wraps within its own balance card.
- At <=900px the hero explicitly stacks to a single column and the balance card stretches to available width.
- At <=620px spacing and MGP display size are reduced slightly for phone readability.
- Existing scenic artwork treatment remains unchanged.

## Selective responsive audit

- Gold Saucer shared disclosure pointers remain pinned to the right-side grid column at <=760px.
- Chocobo Racing keeps its existing <=800px, <=560px, and <=390px responsive transitions.
- Triple Triad opponent cards keep their <=760px, <=540px, and <=390px compact layouts.
- Retainer Hotfix 2's explicit 12-column grid remains present; profile/current panels still stack at <=980px and portrait bounds remain intact.
- No gameplay, MGP economy, Retainer economy, persistence, migration, artwork, or Portal action behavior changed.

## Rendered viewport probes

A Chromium layout fixture using the shipping `portal.css` was measured at representative widths:

- **390px:** one-column hero; copy **332px**, balance **332px**, document scroll width **390px**.
- **430px:** one-column hero; copy **368.8px**, balance **368.8px**, document scroll width **430px**.
- **768px:** one-column hero; copy **705.2px**, balance **705.2px**, document scroll width **768px**.
- **1080px:** two-column hero resolves to approximately **633.3px + 360px**; document scroll width **1080px**.
- **1366px:** two-column hero resolves to approximately **918.3px + 360px**; document scroll width **1366px**.

No horizontal overflow was observed in the viewport probes. The 390px and 1080px fixtures were also visually inspected after rendering; the crushed title column shown in the reported screenshot is no longer present.

## Automated regression

- Frontend Node tests: **540 / 540 PASS**
- Hosted Web/API Python tests: **60 / 60 PASS**
- Web Python parse: **14 / 14 PASS**
- JS/MJS syntax: **198 / 198 PASS**
- CSS structural/selective checks: **8 / 8 PASS**
- WebP decode: **843 / 843 PASS**
- Public PNG count: **0**

The canonical Alpha 2 Bot is unchanged by this Web-only hotfix. The packaged Web source does not contain installed `node_modules`, so a local Vite production-build pass is not claimed.

## Packaging verification

- Hotfix 2 → Hotfix 3 Web overlay patch reconstructs the verified Hotfix 3 Web tree byte-for-byte (**1180 files**).
- Complete archive Web tree matches the verified Hotfix 3 source tree byte-for-byte.
- Complete archive Bot tree matches the Hotfix 2 canonical Bot tree byte-for-byte.
- Web, patch, and Complete ZIP integrity checks pass.
- Safety scan passes with no live database files, exact `.env` files, Python caches/bytecode, or `node_modules` in the release archives.
