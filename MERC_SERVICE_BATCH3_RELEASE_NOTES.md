# Crystal Guild v1.8 — Merc Service Alpha 1 — Batch 3

Code-only Web Portal/API implementation. No new Merc artwork is included in this batch.

## Portal
- Adds **Hero Merc Service** under Guild Services.
- Displays live Hunt Marks, level, Hunt clears, current contract, and the full Merc roster.
- Shows Hero unlock/lock state, role, specialty, weapon, signature effect summary, fee, and eligible mission types.
- Supports selecting Hunt, Venture, or Raid where the Hero permits it.
- Supports authenticated hire and non-refundable cancel actions.
- Mobile roster collapses to one column with touch-safe selectors.

## Hosted API
- Adds `MERC_STATE`, `MERC_HIRE`, and `MERC_CANCEL` to the authenticated action relay.
- Advances hosted runtime to `1.8.0-merc-a1` and Portal Action protocol to **34**.
- Hosted sync schema remains **1**.
- Merc payloads are strict and bounded.

## Staging
The visible frontend/Guide release label remains the frozen 1.7 identity in Batch 3. Batch 4 advances the player-facing 1.8 Guide / What's New identity together with Merc documentation.
