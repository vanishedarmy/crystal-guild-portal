# Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 5

## Player Guide Mobile Top Cleanup

This focused Web revision removes the overbuilt stack at the top of the Player Guide on phones and replaces it with a compact, task-first entry experience.

### Mobile Player Guide
- The redundant **Guide Sections** second header is hidden on phone layouts; the shared Crystal Guild site header remains the only page header.
- The oversized flavor hero and horizontally scrolling stat chips are replaced on phones by a compact **Player Guide** introduction. Desktop keeps the full existing hero presentation.
- The Guide index is reduced to **Browse by section**, a compact **All sections** drawer control, and the existing grouped section picker.
- The full-width **Collapse All** control is removed from phone layouts; single-section accordion behavior already provides the more useful mobile interaction.
- Browse controls and Guide search are visually joined into one compact toolbox and appear before the first Guide section.
- The search field, Clear action, section picker, and drawer control retain mobile touch sizing and accessible labels.
- The new **All sections** control opens the existing accessible Guide drawer and receives focus back after the drawer is dismissed.
- Phone section content begins substantially higher on the page, with no decorative spacer band or oversized stat strip consuming the first viewport.

### Preserved mobile work
- Retainer action-first navigation/order, compact cards, bounded art, and touch sizing remain unchanged.
- Guide single-open mobile sections, Back to guide index controls, search result announcements, drawer inert/focus trapping, and current-section state remain intact.

### Preserved Hotfix 5 gameplay/UI behavior
- Rally/Stream Venture remains **100% Encounter / 0% Treasure Chest**.
- Solo Venture remains **80% Encounter / 20% Treasure**.
- Weapon + Armor Best use, ☆/★ Favorites, item-level sorting, and removal of `Replaces X` remain intact.
- The paired Bot retains the Solo Venture treasure → Treasure Seekers/Treasure Hunters progress correction.

Runtime/frontend remains `1.7.1-resynthesis-a2h5`; paired Bot remains `1.7.1-resynthesis-a2h5`; schema **15**; hosted sync **1**; Portal protocol **32**. No database migration or player reset.
