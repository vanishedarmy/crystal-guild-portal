# Crystal Guild v1.1.18 — Retro Phase 1 Hotfix 1 Release Notes

Hotfix 1 is a **Web-only Solo Venture ability-picker cleanup** built directly on v1.1.18 Retro Phase 1.

## Solo Venture abilities

- The Ability picker now shows **only abilities that are currently usable**.
- Locked, unavailable, invalid-for-the-current-state, or insufficient-resource abilities are omitted from the list rather than shown disabled.
- Each ability row now displays only:
  - **Ability name**
  - **MP/AP cost**
- Target labels, descriptions, trait chips, availability/reason copy, and the extra “Use” label have been removed from the Solo Venture picker.
- Ability rows are substantially shorter and denser on desktop and mobile.
- If no ability is currently usable, the picker explicitly says **“No abilities are currently available.”**

This hotfix changes presentation only. Ability legality, MP/AP validation, combat resolution, targeting, damage/effects, and server-side Portal action validation remain authoritative and unchanged.

## Compatibility

- Bot runtime: `1.1.17-arsenal-ii-h4` unchanged
- Hosted Web runtime: `1.1.18-retro-phase-1` unchanged
- Frontend asset revision: `1.1.18-retro-phase1h1`
- Local DB schema: **5** unchanged
- Hosted sync schema: **1** unchanged
- Portal Action protocol: **14** unchanged
- Twitch prefix: `!` unchanged

No database migration, player reset, OAuth change, new environment variable, or Bot redeploy is required.
