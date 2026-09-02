# Crystal Guild v1.7.0 — Moogle Emporium Annex Alpha 3 — UI Compactness Hotfix 4

Hotfix 4 is a narrow UI pass based on the verified Cloud Storage Hotfix 3 complete baseline. It changes presentation only.

## UI changes

- Blacksmith tab subtitles no longer repeat **Active**; they read simply **Craft items** and **Upgrade equipment**.
- The registered Chocobo companion card now hugs its content instead of stretching to the neighboring management card, with tighter internal spacing.
- Moogle Emporium buy cards no longer show long item-description paragraphs; equipment cards retain stat boosts, comparisons, Job eligibility, level requirements, price, ownership, and purchase controls.
- Blacksmith recipe cards use tighter padding/material rows and no longer stretch to match the tallest card in a row.
- The Fellowship level card is bounded and tightened on mobile so its level/progress display cannot extend beyond the viewport.
- Crystal Guild Connection is reduced to the connection heading/status plus a compact **Refresh connection** action; the redundant linked-account explanation is removed.

No prices, item stats, recipes, Fellowship progression, Chocobo progression, Portal actions, Retainer behavior, Annex behavior, Gold Saucer behavior, or database state changed.

Web runtime/frontend revision: `1.7.0-emporium-annex-a3h4`. Pair with Bot `1.7.0-emporium-annex-a3h3`. Schema remains **15**, hosted sync **1**, Portal Action protocol **31**, prefix `!`.
