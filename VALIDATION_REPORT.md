# Validation Report — v1.1.16 Arsenal Hotfix 3

## Root-cause reproduction

A representative Arsenal Adventure Board result measured about 12.8 KiB while idle and about 16.0 KiB during an interactive Solo Venture with only one battle item. A stocked test character with all eligible battle consumables produced an Adventure Board result of about 21.6 KiB, exceeding the former 16 KiB action-result ceiling.

Hotfix 3 separates request and result limits: browser action payloads remain capped at 16 KiB while authoritative Bot result envelopes are capped at 64 KiB.

## Automated validation

- Bot regression suite: 366 / 366 PASS (Bot unchanged from Arsenal Hotfix 1)
- Frontend tests: 171 / 171 PASS
- Hosted Portal/API tests: 45 / 45 PASS
- Python grammar sweep: 74 / 74 PASS
- Frontend JS/JSX/MJS syntax sweep: 104 / 104 files PASS

Dedicated regressions verify that:
- an Adventure Board result larger than 16 KiB can complete successfully;
- results above the new 64 KiB bound are still rejected;
- an unloaded Adventure Board retries initial state recovery every five seconds;
- the Solo Venture card does not display a false READY state before authoritative data arrives;
- Hotfix 2 queue coalescing/idempotent Solo action protections remain intact.

No schema, hosted-sync, Portal-protocol, OAuth, or Bot-runtime changes are introduced.

## Package certification

- Extracted Complete package: 366 / 366 Bot, 171 / 171 frontend, 45 / 45 hosted Portal/API PASS.
- Hotfix 2 + Hotfix 3 Web patch compared with finalized Hotfix 3 tree: 0 file-content differences.
- Standalone Hotfix 3 Web package compared with finalized Web tree: 0 file-content differences.
- Complete Hotfix 3 package compared with finalized complete tree: 0 file-content differences.
