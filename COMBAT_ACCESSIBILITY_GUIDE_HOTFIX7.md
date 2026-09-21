# Crystal Guild v1.9.0 Alpha 6 — Combat Accessibility & Guide Hotfix 7

This Web/Portal hotfix improves combat readability without changing combat balance or encounter rules.

## Combat accessibility
- Offense and direct damage actions use red/orange accents.
- Healing and recovery use green accents.
- Support, buffs, and utility use purple accents.
- Defensive actions use blue accents.
- Text labels remain visible, so color is never the only cue.
- Focus, hover, active, disabled, and high-contrast states remain distinct.

## Denser battle controls
- Ability and item cards use shorter effect summaries generated from current ability data.
- Redundant helper text is removed from core action, ability, and item sections.
- Desktop grids fit more choices per row while mobile keeps touch-friendly controls.
- Mobile command areas use two columns where space safely permits.

## Player-facing language
- Replaced implementation-style phrases such as synchronization, queued-action explanations, and engineering-oriented readiness wording with direct player language.
- Raid readiness now reads as Party Ready / Ready instead of actionable-raider or queued-action jargon.
- Loading states explain what the player can do without referring to internal synchronization.

## Player Guide FAQ
The FAQ now includes concise answers for:
- World Events.
- Combat action colors.
- The Moogle Trading Post.
- Moogle Emporium Annex stock bonuses.
- Retroactive achievement Title unlocks.
- Broad monster-defeat requirements versus activity-specific objectives.

## Compatibility
- No combat numbers, costs, cooldowns, rewards, encounter rules, or player progression are changed.
- Schema remains 19, hosted sync remains 1, and Portal Action protocol remains 36.
- No player reset or migration is required.
