# Crystal Guild v1.1.19 — Retro Phase III Release Notes

Frontend asset revision: `1.1.19-retro-phase-iii1`.

## Gear artwork rollout

### CG-GEAR-R11 — Whips, Chains & Flails
`leather_whip`, `spiked_chain`, `thorn_whip`, `flame_whip`, `frost_whip`, `lightning_whip`, `venom_whip`, `royal_flail`, `morning_star`, `dragonfire_whip`.

`Morbol Lash` now resolves to the new venom-whip identity instead of the unrestricted shared fallback.

### CG-GEAR-R12 — Firearms & Magitek Weapons
`copper_pistol`, `iron_pistol`, `flintlock_pistol`, `steel_revolver`, `mythril_revolver`, `mythril_musket`, `magitek_pistol`, `cerulean_rifle`, `machina_repeater`, `magitek_hand_cannon`.

Live firearm catalog identities now map to these exact sprites; related carbine/cannon/repeater aliases use the nearest named Phase III identity.

### CG-GEAR-R13 — Grimoires & Spellbooks
`arcane_grimoire`, `enchanted_grimoire`, `rubybound_grimoire`, `frostbound_grimoire`, `inferno_grimoire`, `stormbound_grimoire`, `holy_grimoire`, `shadow_grimoire`, `starfall_grimoire`, `astral_grimoire`.

These are packaged as direct future-ready identities without adding new gameplay items to the catalog.

## Consolidation and cleanup

- CG-GEAR-R01–R13 consolidated into `retro-phase-iii/weapon-icons-v1/`.
- Total named weapon assets: **130**.
- All new R11–R13 assets normalized to **512×512 RGBA PNG with transparency**.
- Superseded `retro-phase-ii/weapon-icons-v5/` removed from the full build.
- Three checkpoint-specific gear test files consolidated into one Retro Phase III gear-art test suite.
- Historical checkpoint release/upgrade/validation documents removed and summarized in `HISTORY.md`.

## Compatibility

No database migration, player reset, OAuth change, environment-variable change, hosted sync schema change, or Portal Action protocol change is required.
