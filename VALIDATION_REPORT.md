# Crystal Guild v1.3.0 — Guild Expansion Beta 2 Validation Report

## Result
**PASS**

## Automated suites
- Frontend Node regression suite: **352 / 352 PASS**.
- Hosted Web/API Python suite: **47 / 47 PASS**.
- Compatible Beta 1 Bot Python suite: **475 / 475 PASS**.
- New Beta 2 Fellowship UX regressions: **3 / 3 PASS** (included in frontend total).

The compatible Bot test log includes intentional simulated Twitch outages, acknowledgement-loss recovery, temporary live/subscription lookup failures, and runtime-checkpoint recovery scenarios. Those tests pass and are not Beta 2 failures.

## Beta 2 UX coverage
- Current Project, Guild Airship, Weekly Orders, and Guild Legacy are the first Fellowship status cards.
- CSS reading order keeps the detailed active project, live Airship state, and Weekly Orders above secondary Guild reference sections.
- Guild Facilities and Facility Services are browser-persistent disclosures.
- Expedition Guild Board, Available Guild Work, Airship catalog/upgrades/history, Legacy Goals, and Fellowship Deeds preserve their disclosure state in local storage.
- Current Airship mission/ready state remains visible even when deep Airship reference detail is collapsed.
- Current Legacy Hall stage and trophy shelf remain visible even when the accomplishment ledger is collapsed.
- Narrow-phone layouts collapse secondary content, stack priority cards, and wrap long Guild labels without horizontal overflow.
- Fellowship disclosure controls retain visible keyboard focus and minimum 44px / coarse-pointer 48px interaction targets.

## Source validation
- Python source compilation: **88 / 88 PASS** across Web + compatible Bot source trees.
- Frontend JS/JSX TypeScript-parser sweep: **65 / 65 PASS**.
- Plain JS/MJS `node --check`: **142 / 142 PASS**.
- Literal static/artwork route audit: **154 routes checked / 0 missing**.

## Compatibility
- Hosted Web runtime: `1.3.0-guild-expansion-b2`
- Frontend asset revision: `1.3.0-guild-expansion-b2`
- Compatible Bot runtime: `1.3.0-guild-expansion-b1`
- Local DB schema: **9**
- Hosted sync schema: **1**
- Portal Action protocol: **21**
- Twitch prefix: `!`
- Database migration: **none**
- Player reset: **none**
- OAuth change: **none**
- New environment variables: **none**

## Final package verification
- Beta 1 → Beta 2 Web patch: **39 changed/new files, 0 deletions**; reconstructs **804 / 804** final Web files exactly.
- Compatible Beta 1 Bot tree: **145 / 145 files unchanged byte-for-byte** from Beta 1.
- ZIP CRC/integrity: **4 / 4 PASS**.
- Runtime/private-artifact hygiene: **0 violations** across all release archives.
- SHA-256 checksum verification: **PASS**.
