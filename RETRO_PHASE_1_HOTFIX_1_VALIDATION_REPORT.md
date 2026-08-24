# Crystal Guild v1.1.18 — Retro Phase 1 Hotfix 1 Validation Report

## Automated validation

- Frontend Node tests: **195 / 195 PASS**
- Hosted Portal/API tests: **46 / 46 PASS**
- Unchanged Bot regression tests: **378 / 378 PASS**
- Frontend production bundle: **NOT RUN in the clean archive workspace** because the release archive intentionally excludes `node_modules`.

## Hotfix 1 targeted coverage

PASS — Solo Venture derives its picker from abilities whose authoritative `usable` flag is true.

PASS — unavailable abilities are omitted rather than rendered as disabled cards.

PASS — each visible Solo Venture ability choice contains only the ability name and MP/AP usage cost.

PASS — target text, descriptions, trait chips, unavailable reasons, and the extra “Use” label are absent from the Solo Venture ability picker.

PASS — an explicit empty state is shown when no abilities are currently available.

PASS — compact ability rows retain responsive single-column behavior on narrow phones.

PASS — Job Details and Player Guide ability references keep their richer descriptions/traits; the condensation applies only to Solo Venture combat selection.

## Compatibility

- Bot runtime: `1.1.17-arsenal-ii-h4`
- Hosted Web runtime: `1.1.18-retro-phase-1`
- Frontend asset revision: `1.1.18-retro-phase1h1`
- Local DB schema: **5**
- Hosted sync schema: **1**
- Portal Action protocol: **14**
- Twitch prefix: `!`

No database migration, player reset, OAuth change, new environment variable, or Bot redeploy is required.

## Source integrity

- Bot tree compared against v1.1.18 Retro Phase 1 baseline: **0 differences**.
- Final Web/full/overlay archives are extracted and compared against the finalized source before delivery.
