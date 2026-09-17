# Merc Service Batch 5 Validation

## Result

PASS — Batch 5 artwork integration is regression clean.

## Automated validation

- Frontend unit/regression: 634 / 634 PASS.
- Hosted Web/API: 78 / 78 PASS.
- Bot tree is byte-for-byte unchanged from the sealed Batch 4 Bot, whose full validation was 726 / 726 tests plus 30 / 30 subtests.
- 12 Hero state-card images are present: six available and six unavailable.
- 7 Merc Service scene/support images are present.
- Total Merc Service artwork files: 19.
- Every Merc Service artwork file is WebP and below 400 KB.

## Packaging safeguards

- Python cache files and transient runtime state are excluded from release packaging.
- Batch 5 Web changes are limited to Merc artwork, Merc presentation wiring/styles/tests, and release documentation.
- No schema, protocol, or gameplay migration was introduced.

## Build-environment note

The local source-only workspace does not have frontend npm dependencies installed, so `vite build` cannot execute there without dependency installation. The frontend source/regression suite passes in full and the release package retains the same Vite/package dependency contract as the validated prior Web build.
