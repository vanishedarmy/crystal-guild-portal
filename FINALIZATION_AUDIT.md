# Finalization Audit — Crystal Guild v1.7.0 Retainer Service Alpha 2 Mobile Visual Pass Hotfix 3

**Decision: PASS — selective UI correction baseline.**

Hotfix 3 addresses the Gold Saucer mobile/intermediate-width collapse without widening scope into a general redesign. The reported layout failed because `.gold-saucer-hero` used `minmax(0,1fr) auto`; the Current Balance card contains a long explanatory sentence, and the `auto` grid track was allowed to size from that max-content width. At the affected width, the balance track consumed nearly the full hero and reduced the title/intro track to a narrow strip.

## Fix

1. The two-column Gold Saucer hero now uses a bounded 220–360px balance track.
2. The title/intro column and balance card explicitly allow safe shrinkage.
3. The balance note wraps locally rather than driving the outer grid's intrinsic width.
4. The existing <=900px breakpoint is reasserted after the new base rule so phone/tablet layouts stack to one column.
5. The mobile balance card stretches to full width, with a small <=620px spacing/type adjustment.
6. No artwork, game logic, MGP values, Retainer values, database schema, or Portal protocol changed.

## Selective discrepancy pass

The pass intentionally checked only nearby high-risk responsive treatments. Gold Saucer disclosure pointers remain right-pinned, Chocobo Racing and Triple Triad keep their existing narrow-screen transitions, and the Retainer Hotfix 2 12-column/bounded-portrait fix remains intact. No additional visual discrepancy justified another code change in this pass.

## Release contract

- Runtime: `1.7.0-retainer-a2`
- Frontend revision: `1.7.0-retainer-a2h3`
- Local schema: **15**
- Hosted sync: **1**
- Portal protocol: **31**
- Gameplay changes: **none**

## Regression gates

- Frontend: **540/540 PASS**
- Hosted Web/API: **60/60 PASS**
- Web Python parse: **14/14 PASS**
- JS/MJS syntax: **198/198 PASS**
- CSS structural/selective checks: **8/8 PASS**
- WebP decode: **843/843 PASS**
- Public PNG count: **0**
- Chromium viewport probes: **390 / 430 / 768 / 1080 / 1366px PASS**, with no horizontal overflow.

No database, secrets, installed dependencies, runtime overlay state, or player data belong in the release archives.

## Packaging verification

- Hotfix 2 → Hotfix 3 Web overlay reconstruction: **PASS**.
- Complete Web tree vs verified Hotfix 3 Web source: **PASS**.
- Complete Bot tree vs canonical Hotfix 2 Bot: **PASS / byte-identical**.
- Archive integrity: **PASS** for Web, patch, and Complete ZIPs.
- Release safety scan: **PASS**; no live databases, exact `.env`, `node_modules`, Python cache/bytecode, or runtime state included.
