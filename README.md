# Crystal Guild v1.1.19 — Retro Phase III

Retro Phase III is a Web-focused visual consolidation release built from the verified v1.1.18 Retro Phase II ii40 checkpoint. It rolls the named equipment artwork forward into a clean Phase III namespace while preserving all gameplay and Portal behavior from the baseline.

## What changed

- **CG-GEAR-R11 — Whips, Chains & Flails:** 10 standalone transparent PNG assets.
- **CG-GEAR-R12 — Firearms & Magitek Weapons:** 10 standalone transparent PNG assets. Existing pistol, revolver, musket, rifle, repeater, and Magitek firearm identities now prefer their exact new artwork instead of shared placeholders.
- **CG-GEAR-R13 — Grimoires & Spellbooks:** 10 standalone transparent PNG assets, packaged as direct future-ready caster equipment identities.
- **Consolidated weapon library:** CG-GEAR-R01 through R13 now live together under `frontend/public/retro-phase-iii/weapon-icons-v1/` as **130 individual 512×512 RGBA PNG files**.
- **Cleanup:** the superseded `retro-phase-ii/weapon-icons-v5/` library and old checkpoint-only release/upgrade/validation documents were removed from the full package. Historical milestones are summarized in `HISTORY.md`.

## Technical identity

- Hosted Web runtime: `1.1.19-retro-phase-iii`
- Frontend asset revision: `1.1.19-retro-phase-iii1`
- Hosted sync schema: `1` (unchanged)
- Portal Action protocol: `14` (unchanged)
- Database migration: **none**
- Player reset: **none**

Existing Retro Phase II region, monster, boss, item, material, armor, accessory, and fallback weapon assets remain in their established directories so the release does not duplicate large production assets unnecessarily.
