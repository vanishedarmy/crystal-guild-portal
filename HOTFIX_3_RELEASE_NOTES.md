# Crystal Guild v1.1.17 — Arsenal II Hotfix 3 Release Notes

Hotfix 3 is a Web-only graphical and spacing continuity pass focused on selectable Adventure Board cards.

## Adventure Board region continuity

- Region cards now stretch to a consistent row height on desktop/tablet grids.
- Every Travel button uses the same full card width and the same action height, so short and wrapped labels no longer create mismatched button sizes.
- Action controls remain pinned to the bottom of each region card regardless of description length.
- Requirement/cooldown helper text uses a consistent spacing slot beneath the action control.
- Mobile keeps the full-width control treatment while relaxing fixed row-height behavior for natural single-column flow.

## Hunt card rhythm

- Hunt cards now use the same bottom-anchored action rhythm so differing reward/trait copy does not pull the dispatch area upward.

## Compatibility

- Bot runtime: `1.1.17-arsenal-ii` unchanged
- Hosted Web runtime: `1.1.17-arsenal-ii` unchanged
- Frontend asset revision: `1.1.17-arsenal-ii1h3`
- Local DB schema: **5** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **14** unchanged

No database migration, player reset, OAuth change, Render secret, or Bot redeploy is required.
