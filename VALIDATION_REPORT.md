# Validation — Crystal Guild v1.1.19 Retro Phase III

Frontend asset revision: `1.1.19-retro-phase-iii1`.

## Automated validation

- Frontend Node test suite: **272 / 272 passed**.
- Hosted Web/API Python test suite: **46 / 46 passed**.
- Python package compile check: **passed**.
- Consolidated named weapon library: **130 / 130 PNG files present**.
- CG-GEAR-R11: **10 / 10** files present.
- CG-GEAR-R12: **10 / 10** files present.
- CG-GEAR-R13: **10 / 10** files present.
- All 130 consolidated weapon assets validate as **512×512 RGBA PNG** files with real transparent pixels.
- R12 live firearm catalog mappings resolve to exact named Phase III sprites.
- `Morbol Lash` resolves to the R11 venom-whip sprite.
- R13 grimoire identities resolve to their packaged direct artwork paths without adding new gameplay catalog entries.
- Shared Phase II weapon family/tier fallbacks remain available for equipment outside direct named identities.

## Cleanup validation

Compared with the v1.1.18 Retro Phase II ii40 full source:

- Top-level package files reduced from **163** to **20** before packaging metadata.
- **146** obsolete/historical checkpoint documentation/manifest files removed.
- Superseded `frontend/public/retro-phase-ii/weapon-icons-v5/` removed (**100 files**).
- Three ii38/ii39/ii40 gear-art checkpoint test files consolidated into one Retro Phase III gear-art suite.
- Historical release milestones consolidated into `HISTORY.md`.
- Existing region, monster, boss, item, material, armor, accessory, and still-used fallback weapon assets were preserved.

## Compatibility

- Hosted Web runtime: `1.1.19-retro-phase-iii`
- Hosted sync schema: `1` — unchanged
- Portal Action protocol: `14` — unchanged
- Database migration: none
- Player reset: none
- OAuth/environment changes: none

## Patch verification

- ii40 baseline + Retro Phase III patch + documented deletion pass produced an **exact file-for-file SHA-256 match** with the clean v1.1.19 working tree.
- All **192 direct named weapon artwork references** resolve to packaged Phase III PNGs; the direct map references **130 unique files** with no missing assets.
