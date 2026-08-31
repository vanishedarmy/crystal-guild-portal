const ITEM_ART_BASE = "/retro-phase-iii/item-icons-v1";
const ITEM_MATERIAL_BASE = "/retro-phase-ii/item-materials-v5";
const MATERIAL_ITEM_BASE = "/retro-phase-iii/material-icons-v1";
const MATERIAL_METAL_BASE = "/retro-phase-ii/material-metals-v2";
const ELEMENTAL_CRYSTAL_BASE = "/retro-phase-ii/elemental-crystals-v2";
const WEAPON_ITEM_BASE = "/retro-phase-iii/weapon-icons-v2";
const RELIC_WEAPON_BASE = "/retro-phase-iii/relic-weapons-v1";
const WEAPON_FAMILY_BASE = "/retro-phase-iii/weapon-families-v1";
const EQUIPMENT_FAMILY_BASE = "/retro-phase-iii/equipment-families-v1";

export const ITEM_ART_IDS = new Set([
  "potion",
  "hi_potion",
  "mega_potion",
  "x_potion",
  "ether",
  "hi_ether",
  "turbo_ether",
  "phoenix_down",
  "tent",
  "elixir",
  "antidote",
  "echo_herbs",
  "remedy",
  "eye_drops",
  "chronos_tear",
  "smelling_salts",
  "panacea",
  "stamina_draught",
  "regen_tonic",
  "megalixir",
  "warriors_tonic",
  "heros_brew",
  "iron_tonic",
  "swiftwater",
  "war_horn",
  "mages_incense",
  "smoke_bomb",
  "arctic_wind",
  "lightning_marble",
  "water_gem",
  "earth_drum",
  "shadow_gem",
]);

const WEAPON_FAMILIES = new Set([
  "sword", "axe", "spear", "staff", "dagger", "katana", "knuckles", "firearm", "instrument", "rapier", "wand", "bow", "tome", "noulith", "unrestricted",
]);

const WEAPON_ART_BY_ID = new Map([
  // CG-GEAR-R01 — Swords & Great Blades.
  ["iron_sword", `${WEAPON_ITEM_BASE}/iron_sword.webp`],
  ["iron_blade", `${WEAPON_ITEM_BASE}/iron_sword.webp`],
  ["steel_sword", `${WEAPON_ITEM_BASE}/steel_sword.webp`],
  ["steel_longsword", `${WEAPON_ITEM_BASE}/steel_sword.webp`],
  ["mythril_sword", `${WEAPON_ITEM_BASE}/mythril_sword.webp`],
  ["flametongue", `${WEAPON_ITEM_BASE}/flametongue.webp`],
  ["flame_tongue", `${WEAPON_ITEM_BASE}/flametongue.webp`],
  ["icebrand", `${WEAPON_ITEM_BASE}/icebrand.webp`],
  ["coral_sword", `${WEAPON_ITEM_BASE}/coral_sword.webp`],
  ["blood_sword", `${WEAPON_ITEM_BASE}/blood_sword.webp`],
  ["defender", `${WEAPON_ITEM_BASE}/defender.webp`],
  ["defender_blade", `${WEAPON_ITEM_BASE}/defender.webp`],
  ["excalibur", `${WEAPON_ITEM_BASE}/excalibur.webp`],
  ["excalibur_dormant", `${RELIC_WEAPON_BASE}/excalibur_dormant.webp`],
  ["excalibur_awakened", `${RELIC_WEAPON_BASE}/excalibur_awakened.webp`],
  ["excalibur_zenith", `${RELIC_WEAPON_BASE}/excalibur_zenith.webp`],
  ["ragnarok", `${WEAPON_ITEM_BASE}/ragnarok.webp`],

  // Relic weapon stage identity — dedicated SNES/FF visual progression.
  ["gae_bolg_dormant", `${RELIC_WEAPON_BASE}/gae_bolg_dormant.webp`],
  ["gae_bolg_awakened", `${RELIC_WEAPON_BASE}/gae_bolg_awakened.webp`],
  ["gae_bolg_zenith", `${RELIC_WEAPON_BASE}/gae_bolg_zenith.webp`],
  ["apocalypse_dormant", `${RELIC_WEAPON_BASE}/apocalypse_dormant.webp`],
  ["apocalypse_awakened", `${RELIC_WEAPON_BASE}/apocalypse_awakened.webp`],
  ["apocalypse_zenith", `${RELIC_WEAPON_BASE}/apocalypse_zenith.webp`],
  ["last_knife_dormant", `${RELIC_WEAPON_BASE}/last_knife_dormant.webp`],
  ["last_knife_awakened", `${RELIC_WEAPON_BASE}/last_knife_awakened.webp`],
  ["last_knife_zenith", `${RELIC_WEAPON_BASE}/last_knife_zenith.webp`],
  ["bravura_dormant", `${RELIC_WEAPON_BASE}/bravura_dormant.webp`],
  ["bravura_awakened", `${RELIC_WEAPON_BASE}/bravura_awakened.webp`],
  ["bravura_zenith", `${RELIC_WEAPON_BASE}/bravura_zenith.webp`],
  ["murgleis_dormant", `${RELIC_WEAPON_BASE}/murgleis_dormant.webp`],
  ["murgleis_awakened", `${RELIC_WEAPON_BASE}/murgleis_awakened.webp`],
  ["murgleis_zenith", `${RELIC_WEAPON_BASE}/murgleis_zenith.webp`],
  ["yoshimitsu_dormant", `${RELIC_WEAPON_BASE}/yoshimitsu_dormant.webp`],
  ["yoshimitsu_awakened", `${RELIC_WEAPON_BASE}/yoshimitsu_awakened.webp`],
  ["yoshimitsu_zenith", `${RELIC_WEAPON_BASE}/yoshimitsu_zenith.webp`],
  ["veil_of_wiyu_dormant", `${RELIC_WEAPON_BASE}/veil_of_wiyu_dormant.webp`],
  ["veil_of_wiyu_awakened", `${RELIC_WEAPON_BASE}/veil_of_wiyu_awakened.webp`],
  ["veil_of_wiyu_zenith", `${RELIC_WEAPON_BASE}/veil_of_wiyu_zenith.webp`],
  ["almace_dormant", `${RELIC_WEAPON_BASE}/almace_dormant.webp`],
  ["almace_awakened", `${RELIC_WEAPON_BASE}/almace_awakened.webp`],
  ["almace_zenith", `${RELIC_WEAPON_BASE}/almace_zenith.webp`],
  ["chronos_dormant", `${RELIC_WEAPON_BASE}/chronos_dormant.webp`],
  ["chronos_awakened", `${RELIC_WEAPON_BASE}/chronos_awakened.webp`],
  ["chronos_zenith", `${RELIC_WEAPON_BASE}/chronos_zenith.webp`],
  ["artemis_bow_dormant", `${RELIC_WEAPON_BASE}/artemis_bow_dormant.webp`],
  ["artemis_bow_awakened", `${RELIC_WEAPON_BASE}/artemis_bow_awakened.webp`],
  ["artemis_bow_zenith", `${RELIC_WEAPON_BASE}/artemis_bow_zenith.webp`],
  ["armageddon_dormant", `${RELIC_WEAPON_BASE}/armageddon_dormant.webp`],
  ["armageddon_awakened", `${RELIC_WEAPON_BASE}/armageddon_awakened.webp`],
  ["armageddon_zenith", `${RELIC_WEAPON_BASE}/armageddon_zenith.webp`],
  ["guttler_dormant", `${RELIC_WEAPON_BASE}/guttler_dormant.webp`],
  ["guttler_awakened", `${RELIC_WEAPON_BASE}/guttler_awakened.webp`],
  ["guttler_zenith", `${RELIC_WEAPON_BASE}/guttler_zenith.webp`],
  ["astral_codex_dormant", `${RELIC_WEAPON_BASE}/astral_codex_dormant.webp`],
  ["astral_codex_awakened", `${RELIC_WEAPON_BASE}/astral_codex_awakened.webp`],
  ["astral_codex_zenith", `${RELIC_WEAPON_BASE}/astral_codex_zenith.webp`],

  // CG-GEAR-R02 — Daggers, Rapiers & Rogue Weapons.
  ["knife", `${WEAPON_ITEM_BASE}/knife.webp`],
  ["dagger", `${WEAPON_ITEM_BASE}/dagger.webp`],
  ["bronze_dagger", `${WEAPON_ITEM_BASE}/dagger.webp`],
  ["mythril_knife", `${WEAPON_ITEM_BASE}/mythril_knife.webp`],
  ["mythril_dagger", `${WEAPON_ITEM_BASE}/mythril_knife.webp`],
  ["mage_masher", `${WEAPON_ITEM_BASE}/mage_masher.webp`],
  ["poison_fang", `${WEAPON_ITEM_BASE}/poison_fang.webp`],
  ["main_gauche", `${WEAPON_ITEM_BASE}/main_gauche.webp`],
  ["assassins_dagger", `${WEAPON_ITEM_BASE}/assassins_dagger.webp`],
  ["rapier", `${WEAPON_ITEM_BASE}/rapier.webp`],
  ["copper_rapier", `${WEAPON_ITEM_BASE}/rapier.webp`],
  ["rune_blade", `${WEAPON_ITEM_BASE}/rune_blade.webp`],
  ["ultima_blade", `${WEAPON_ITEM_BASE}/ultima_blade.webp`],

  // CG-GEAR-R03 — Axes, Hammers & Heavy Weapons.
  ["battle_axe", `${WEAPON_ITEM_BASE}/battle_axe.webp`],
  ["hunters_axe", `${WEAPON_ITEM_BASE}/battle_axe.webp`],
  ["ornate_battle_axe", `${WEAPON_ITEM_BASE}/ornate_battle_axe.webp`],
  ["bronze_waraxe", `${WEAPON_ITEM_BASE}/ornate_battle_axe.webp`],
  ["froststeel_greataxe", `${WEAPON_ITEM_BASE}/froststeel_greataxe.webp`],
  ["iron_waraxe", `${WEAPON_ITEM_BASE}/froststeel_greataxe.webp`],
  ["crescent_greataxe", `${WEAPON_ITEM_BASE}/crescent_greataxe.webp`],
  ["steel_greataxe", `${WEAPON_ITEM_BASE}/crescent_greataxe.webp`],
  ["mythril_crescent_axe", `${WEAPON_ITEM_BASE}/mythril_crescent_axe.webp`],
  ["mythril_greataxe", `${WEAPON_ITEM_BASE}/mythril_crescent_axe.webp`],
  ["ogrekiller", `${WEAPON_ITEM_BASE}/ogrekiller.webp`],
  ["ogre_cleaver", `${WEAPON_ITEM_BASE}/ogrekiller.webp`],
  ["ogre_axe", `${WEAPON_ITEM_BASE}/ogrekiller.webp`],
  ["runic_frostfire_axe", `${WEAPON_ITEM_BASE}/runic_frostfire_axe.webp`],
  ["rune_axe", `${WEAPON_ITEM_BASE}/runic_frostfire_axe.webp`],
  ["steel_warhammer", `${WEAPON_ITEM_BASE}/steel_warhammer.webp`],
  ["mythril_hammer", `${WEAPON_ITEM_BASE}/mythril_hammer.webp`],
  ["earthshaker_hammer", `${WEAPON_ITEM_BASE}/earthshaker_hammer.webp`],

  // CG-GEAR-R04 — Spears & Polearms.
  ["spear", `${WEAPON_ITEM_BASE}/spear.webp`],
  ["training_spear", `${WEAPON_ITEM_BASE}/spear.webp`],
  ["javelin", `${WEAPON_ITEM_BASE}/javelin.webp`],
  ["mythril_spear", `${WEAPON_ITEM_BASE}/mythril_spear.webp`],
  ["mythril_lance", `${WEAPON_ITEM_BASE}/mythril_spear.webp`],
  ["trident", `${WEAPON_ITEM_BASE}/trident.webp`],
  ["coral_trident", `${WEAPON_ITEM_BASE}/trident.webp`],
  ["partisan", `${WEAPON_ITEM_BASE}/partisan.webp`],
  ["ice_lance", `${WEAPON_ITEM_BASE}/ice_lance.webp`],
  ["holy_lance", `${WEAPON_ITEM_BASE}/holy_lance.webp`],
  ["dragon_lance", `${WEAPON_ITEM_BASE}/dragon_lance.webp`],
  ["dragon_spear", `${WEAPON_ITEM_BASE}/dragon_lance.webp`],
  ["dragonbone_spear", `${WEAPON_ITEM_BASE}/dragon_lance.webp`],
  ["wyvern_spear", `${WEAPON_ITEM_BASE}/dragon_lance.webp`],
  ["wyvern_lance", `${WEAPON_ITEM_BASE}/dragon_lance.webp`],
  ["gungnir", `${WEAPON_ITEM_BASE}/gungnir.webp`],
  ["gungnir_fragment", `${WEAPON_ITEM_BASE}/gungnir.webp`],
  ["longinus", `${WEAPON_ITEM_BASE}/longinus.webp`],

  // CG-GEAR-R05 — Staves, Rods & Mage Weapons.
  ["oak_staff", `${WEAPON_ITEM_BASE}/oak_staff.webp`],
  ["elm_staff", `${WEAPON_ITEM_BASE}/elm_staff.webp`],
  ["rune_staff", `${WEAPON_ITEM_BASE}/rune_staff.webp`],
  ["silver_staff", `${WEAPON_ITEM_BASE}/silver_staff.webp`],
  ["priests_staff", `${WEAPON_ITEM_BASE}/priests_staff.webp`],
  ["fire_rod", `${WEAPON_ITEM_BASE}/fire_rod.webp`],
  ["frost_rod", `${WEAPON_ITEM_BASE}/frost_rod.webp`],
  ["thunder_rod", `${WEAPON_ITEM_BASE}/thunder_rod.webp`],
  ["elemental_staff", `${WEAPON_ITEM_BASE}/elemental_staff.webp`],
  ["high_mage_staff", `${WEAPON_ITEM_BASE}/elemental_staff.webp`],
  ["wizard_rod", `${WEAPON_ITEM_BASE}/rune_staff.webp`],
  ["magus_staff", `${WEAPON_ITEM_BASE}/astral_staff.webp`],
  ["astral_staff", `${WEAPON_ITEM_BASE}/astral_staff.webp`],
  ["sage_staff", `${WEAPON_ITEM_BASE}/priests_staff.webp`],
  ["sage_rod", `${WEAPON_ITEM_BASE}/priests_staff.webp`],
  ["astral_rod", `${WEAPON_ITEM_BASE}/astral_staff.webp`],
  ["nirvana_dormant", `${RELIC_WEAPON_BASE}/nirvana_dormant.webp`],
  ["nirvana_awakened", `${RELIC_WEAPON_BASE}/nirvana_awakened.webp`],
  ["nirvana_zenith", `${RELIC_WEAPON_BASE}/nirvana_zenith.webp`],
  ["stardust_rod_dormant", `${RELIC_WEAPON_BASE}/stardust_rod_dormant.webp`],
  ["stardust_rod_awakened", `${RELIC_WEAPON_BASE}/stardust_rod_awakened.webp`],
  ["stardust_rod_zenith", `${RELIC_WEAPON_BASE}/stardust_rod_zenith.webp`],

  // CG-GEAR-R06 — Bows & Ranged Weapons.
  ["shortbow", `${WEAPON_ITEM_BASE}/shortbow.webp`],
  ["longbow", `${WEAPON_ITEM_BASE}/longbow.webp`],
  ["great_bow", `${WEAPON_ITEM_BASE}/great_bow.webp`],
  ["killer_bow", `${WEAPON_ITEM_BASE}/killer_bow.webp`],
  ["elven_bow", `${WEAPON_ITEM_BASE}/elven_bow.webp`],
  ["rune_bow", `${WEAPON_ITEM_BASE}/rune_bow.webp`],
  ["yoichi_bow", `${WEAPON_ITEM_BASE}/yoichi_bow.webp`],
  ["hunting_rifle", `${WEAPON_ITEM_BASE}/hunting_rifle.webp`],
  ["magitek_rifle", `${WEAPON_ITEM_BASE}/magitek_rifle.webp`],
  ["artemis_bow", `${WEAPON_ITEM_BASE}/artemis_bow.webp`],

  // CG-GEAR-R07 — Katana & Samurai Weapons.
  ["ashigaru_katana", `${WEAPON_ITEM_BASE}/ashigaru_katana.webp`],
  ["iron_katana", `${WEAPON_ITEM_BASE}/iron_katana.webp`],
  ["steel_katana", `${WEAPON_ITEM_BASE}/steel_katana.webp`],
  ["osafune", `${WEAPON_ITEM_BASE}/osafune.webp`],
  ["kogarasu", `${WEAPON_ITEM_BASE}/kogarasu.webp`],
  ["kotetsu", `${WEAPON_ITEM_BASE}/kotetsu.webp`],
  ["kiyomori", `${WEAPON_ITEM_BASE}/kiyomori.webp`],
  ["genji_katana", `${WEAPON_ITEM_BASE}/genji_katana.webp`],
  ["kiku_ichimonji", `${WEAPON_ITEM_BASE}/kiku_ichimonji.webp`],
  ["heavens_cloud", `${WEAPON_ITEM_BASE}/heavens_cloud.webp`],
  ["ronin_katana", `${WEAPON_ITEM_BASE}/steel_katana.webp`],
  ["murasame", `${WEAPON_ITEM_BASE}/osafune.webp`],
  ["murakumo", `${WEAPON_ITEM_BASE}/heavens_cloud.webp`],
  ["ame_no_murakumo", `${WEAPON_ITEM_BASE}/heavens_cloud.webp`],
  ["masamune_dormant", `${RELIC_WEAPON_BASE}/masamune_dormant.webp`],
  ["masamune_awakened", `${RELIC_WEAPON_BASE}/masamune_awakened.webp`],
  ["masamune_zenith", `${RELIC_WEAPON_BASE}/masamune_zenith.webp`],

  // CG-GEAR-R08 — Knuckles, Cesti & Claws.
  ["leather_knuckles", `${WEAPON_ITEM_BASE}/leather_knuckles.webp`],
  ["brass_knuckles", `${WEAPON_ITEM_BASE}/brass_knuckles.webp`],
  ["iron_knuckles", `${WEAPON_ITEM_BASE}/iron_knuckles.webp`],
  ["steel_cesti", `${WEAPON_ITEM_BASE}/steel_cesti.webp`],
  ["tiger_cesti", `${WEAPON_ITEM_BASE}/tiger_cesti.webp`],
  ["mythril_claws", `${WEAPON_ITEM_BASE}/mythril_claws.webp`],
  ["mythril_knuckles", `${WEAPON_ITEM_BASE}/mythril_claws.webp`],
  ["wyvern_claws", `${WEAPON_ITEM_BASE}/wyvern_claws.webp`],
  ["diamond_knuckles", `${WEAPON_ITEM_BASE}/diamond_knuckles.webp`],
  ["tiger_fangs", `${WEAPON_ITEM_BASE}/tiger_cesti.webp`],
  ["demon_claws", `${WEAPON_ITEM_BASE}/demon_claws.webp`],
  ["hell_claws", `${WEAPON_ITEM_BASE}/demon_claws.webp`],
  ["dragon_claws", `${WEAPON_ITEM_BASE}/wyvern_claws.webp`],
  ["kaiser_knuckles", `${WEAPON_ITEM_BASE}/godhand.webp`],
  ["godhand_dormant", `${RELIC_WEAPON_BASE}/godhand_dormant.webp`],
  ["godhand_awakened", `${RELIC_WEAPON_BASE}/godhand_awakened.webp`],
  ["godhand_zenith", `${RELIC_WEAPON_BASE}/godhand_zenith.webp`],

  // CG-GEAR-R09 — Wands, Scepters & Focuses.
  ["ash_wand", `${WEAPON_ITEM_BASE}/ash_wand.webp`],
  ["willow_wand", `${WEAPON_ITEM_BASE}/willow_wand.webp`],
  ["yew_wand", `${WEAPON_ITEM_BASE}/yew_wand.webp`],
  ["silver_wand", `${WEAPON_ITEM_BASE}/silver_wand.webp`],
  ["rune_wand", `${WEAPON_ITEM_BASE}/rune_wand.webp`],
  ["mythril_wand", `${WEAPON_ITEM_BASE}/mythril_wand.webp`],
  ["sages_wand", `${WEAPON_ITEM_BASE}/sages_wand.webp`],
  ["crystal_wand", `${WEAPON_ITEM_BASE}/crystal_wand.webp`],
  ["starfall_wand", `${WEAPON_ITEM_BASE}/starfall_wand.webp`],
  ["stardust_wand", `${WEAPON_ITEM_BASE}/stardust_wand.webp`],
  ["magus_wand", `${WEAPON_ITEM_BASE}/starfall_wand.webp`],
  ["mystic_wand", `${WEAPON_ITEM_BASE}/rune_wand.webp`],

  // CG-GEAR-R10 — Harps & Bard Instruments.
  ["travelers_harp", `${WEAPON_ITEM_BASE}/travelers_harp.webp`],
  ["maple_harp", `${WEAPON_ITEM_BASE}/maple_harp.webp`],
  ["silver_harp", `${WEAPON_ITEM_BASE}/silver_harp.webp`],
  ["rosewood_harp", `${WEAPON_ITEM_BASE}/rosewood_harp.webp`],
  ["faerie_harp", `${WEAPON_ITEM_BASE}/faerie_harp.webp`],
  ["dream_harp", `${WEAPON_ITEM_BASE}/dream_harp.webp`],
  ["siren_harp", `${WEAPON_ITEM_BASE}/siren_harp.webp`],
  ["rune_harp", `${WEAPON_ITEM_BASE}/rune_harp.webp`],
  ["lamia_harp", `${WEAPON_ITEM_BASE}/lamia_harp.webp`],
  ["apollo_harp", `${WEAPON_ITEM_BASE}/apollo_harp.webp`],
  ["seraph_harp", `${WEAPON_ITEM_BASE}/apollo_harp.webp`],
  ["celestial_harp", `${WEAPON_ITEM_BASE}/dream_harp.webp`],
  ["minstrels_harp", `${WEAPON_ITEM_BASE}/rosewood_harp.webp`],

  // CG-GEAR-R11 — Whips, Chains & Flails.
  ["leather_whip", `${WEAPON_ITEM_BASE}/leather_whip.webp`],
  ["spiked_chain", `${WEAPON_ITEM_BASE}/spiked_chain.webp`],
  ["thorn_whip", `${WEAPON_ITEM_BASE}/thorn_whip.webp`],
  ["flame_whip", `${WEAPON_ITEM_BASE}/flame_whip.webp`],
  ["frost_whip", `${WEAPON_ITEM_BASE}/frost_whip.webp`],
  ["lightning_whip", `${WEAPON_ITEM_BASE}/lightning_whip.webp`],
  ["venom_whip", `${WEAPON_ITEM_BASE}/venom_whip.webp`],
  ["morbol_lash", `${WEAPON_ITEM_BASE}/venom_whip.webp`],
  ["royal_flail", `${WEAPON_ITEM_BASE}/royal_flail.webp`],
  ["morning_star", `${WEAPON_ITEM_BASE}/morning_star.webp`],
  ["dragonfire_whip", `${WEAPON_ITEM_BASE}/dragonfire_whip.webp`],

  // CG-GEAR-R12 — Firearms & Magitek Weapons.
  ["copper_pistol", `${WEAPON_ITEM_BASE}/copper_pistol.webp`],
  ["iron_pistol", `${WEAPON_ITEM_BASE}/iron_pistol.webp`],
  ["flintlock_pistol", `${WEAPON_ITEM_BASE}/flintlock_pistol.webp`],
  ["steel_revolver", `${WEAPON_ITEM_BASE}/steel_revolver.webp`],
  ["mythril_revolver", `${WEAPON_ITEM_BASE}/mythril_revolver.webp`],
  ["mythril_musket", `${WEAPON_ITEM_BASE}/mythril_musket.webp`],
  ["magitek_pistol", `${WEAPON_ITEM_BASE}/magitek_pistol.webp`],
  ["cerulean_rifle", `${WEAPON_ITEM_BASE}/cerulean_rifle.webp`],
  ["machina_repeater", `${WEAPON_ITEM_BASE}/machina_repeater.webp`],
  ["magitek_hand_cannon", `${WEAPON_ITEM_BASE}/magitek_hand_cannon.webp`],
  ["magitek_cannon", `${WEAPON_ITEM_BASE}/magitek_hand_cannon.webp`],
  ["aether_carbine", `${WEAPON_ITEM_BASE}/cerulean_rifle.webp`],
  ["cerberus_carbine", `${WEAPON_ITEM_BASE}/magitek_hand_cannon.webp`],
  ["mythril_repeater", `${WEAPON_ITEM_BASE}/mythril_musket.webp`],

  // CG-GEAR-R13 — Grimoires & Spellbooks.
  ["arcane_grimoire", `${WEAPON_ITEM_BASE}/arcane_grimoire.webp`],
  ["enchanted_grimoire", `${WEAPON_ITEM_BASE}/enchanted_grimoire.webp`],
  ["rubybound_grimoire", `${WEAPON_ITEM_BASE}/rubybound_grimoire.webp`],
  ["frostbound_grimoire", `${WEAPON_ITEM_BASE}/frostbound_grimoire.webp`],
  ["inferno_grimoire", `${WEAPON_ITEM_BASE}/inferno_grimoire.webp`],
  ["stormbound_grimoire", `${WEAPON_ITEM_BASE}/stormbound_grimoire.webp`],
  ["holy_grimoire", `${WEAPON_ITEM_BASE}/holy_grimoire.webp`],
  ["shadow_grimoire", `${WEAPON_ITEM_BASE}/shadow_grimoire.webp`],
  ["starfall_grimoire", `${WEAPON_ITEM_BASE}/starfall_grimoire.webp`],
  ["astral_grimoire", `${WEAPON_ITEM_BASE}/astral_grimoire.webp`],
]);

const MATERIAL_ART_BY_ID = new Map([
  // CG-MAT-R01 — verified monster-drop material identities.
  ["wolf_fang", `${MATERIAL_ITEM_BASE}/wolf_fang.webp`],
  ["cactuar_needle", `${MATERIAL_ITEM_BASE}/cactuar_needle.webp`],
  ["bone_chip", `${MATERIAL_ITEM_BASE}/bone_chip.webp`],
  ["fish_scale", `${MATERIAL_ITEM_BASE}/fish_scale.webp`],
  ["coeurl_whisker", `${MATERIAL_ITEM_BASE}/coeurl_whisker.webp`],
  ["chimera_scale", `${MATERIAL_ITEM_BASE}/chimera_scale.webp`],
  ["malboro_tendril", `${MATERIAL_ITEM_BASE}/malboro_tendril.webp`],
  ["behemoth_horn", `${MATERIAL_ITEM_BASE}/behemoth_horn.webp`],
  ["bomb_kings_fuse", `${MATERIAL_ITEM_BASE}/bomb_kings_fuse.webp`],
  ["morbol_bulb", `${MATERIAL_ITEM_BASE}/morbol_bulb.webp`],

  // CG-MAT-R03 — verified hunt and boss material identities.
  ["antlion_mandible", `${MATERIAL_ITEM_BASE}/antlion_mandible.webp`],
  ["sandworm_fang", `${MATERIAL_ITEM_BASE}/sandworm_fang.webp`],
  ["garuda_feather", `${MATERIAL_ITEM_BASE}/garuda_feather.webp`],
  ["death_claw_pincer", `${MATERIAL_ITEM_BASE}/death_claw_pincer.webp`],
  ["dragon_fang", `${MATERIAL_ITEM_BASE}/dragon_fang.webp`],
  ["ultros_tentacle", `${MATERIAL_ITEM_BASE}/ultros_tentacle.webp`],
  ["demon_wall_fragment", `${MATERIAL_ITEM_BASE}/demon_wall_fragment.webp`],
  ["deathgaze_plume", `${MATERIAL_ITEM_BASE}/deathgaze_plume.webp`],
  ["earth_harp", `${MATERIAL_ITEM_BASE}/earth_harp.webp`],
  ["desert_rose", `${MATERIAL_ITEM_BASE}/desert_rose.webp`],
  // CG-MAT-R02 — verified material identities.
  ["triple_chimera_fang", `${MATERIAL_ITEM_BASE}/triple_chimera_fang.webp`],
  ["dragon_scale", `${MATERIAL_ITEM_BASE}/dragon_scale.webp`],
  ["ancient_cloth", `${MATERIAL_ITEM_BASE}/ancient_cloth.webp`],
  ["celestial_thread", `${MATERIAL_ITEM_BASE}/celestial_thread.webp`],
  ["imp_wing", `${MATERIAL_ITEM_BASE}/imp_wing.webp`],
  ["cockatrice_pinion", `${MATERIAL_ITEM_BASE}/cockatrice_pinion.webp`],
  ["ochu_vine", `${MATERIAL_ITEM_BASE}/ochu_vine.webp`],
  ["basilisk_eye", `${MATERIAL_ITEM_BASE}/basilisk_eye.webp`],
  ["lamia_scale", `${MATERIAL_ITEM_BASE}/lamia_scale.webp`],
  ["mindflayer_tentacle", `${MATERIAL_ITEM_BASE}/mindflayer_tentacle.webp`],

  // CG-MAT-R04 — verified rare/endgame/special material identities.
  ["nemesis_mark", `${MATERIAL_ITEM_BASE}/nemesis_mark.webp`],
  ["yiazmat_scale", `${MATERIAL_ITEM_BASE}/yiazmat_scale.webp`],
  ["kaiser_scale", `${MATERIAL_ITEM_BASE}/kaiser_scale.webp`],
  ["long_gui_plate", `${MATERIAL_ITEM_BASE}/long_gui_plate.webp`],
  ["ahriman_lens", `${MATERIAL_ITEM_BASE}/ahriman_lens.webp`],
  ["morbol_spore", `${MATERIAL_ITEM_BASE}/morbol_spore.webp`],
  ["magitek_capacitor", `${MATERIAL_ITEM_BASE}/magitek_capacitor.webp`],
  ["behemoth_hide", `${MATERIAL_ITEM_BASE}/behemoth_hide.webp`],
  ["chocobo_writ", `${MATERIAL_ITEM_BASE}/chocobo_writ.webp`],

  // CG-ITEM-R03 through R06: regenerated SNES-style individual WebP identities.
  ["bomb_fragment", `${ITEM_MATERIAL_BASE}/bomb_fragment.webp`],
  ["iron_ore", `${ITEM_MATERIAL_BASE}/iron_ore.webp`],
  ["copper_ore", `${ITEM_MATERIAL_BASE}/copper_ore.webp`],
  ["bronze_ingot", `${ITEM_MATERIAL_BASE}/bronze_ingot.webp`],
  ["iron_ingot", `${ITEM_MATERIAL_BASE}/iron_ingot.webp`],
  ["steel_ingot", `${ITEM_MATERIAL_BASE}/steel_ingot.webp`],
  ["silver_ore", `${ITEM_MATERIAL_BASE}/silver_ore.webp`],
  ["silver_ingot", `${ITEM_MATERIAL_BASE}/silver_ingot.webp`],
  ["gold_ore", `${ITEM_MATERIAL_BASE}/gold_ore.webp`],
  ["gold_ingot", `${ITEM_MATERIAL_BASE}/gold_ingot.webp`],
  ["mythril_ore", `${ITEM_MATERIAL_BASE}/mythril_ore.webp`],
  ["mythril_ingot", `${ITEM_MATERIAL_BASE}/mythril_ingot.webp`],
  ["darksteel_ore", `${ITEM_MATERIAL_BASE}/darksteel_ore.webp`],
  ["darksteel_ingot", `${ITEM_MATERIAL_BASE}/darksteel_ingot.webp`],
  ["adamantite", `${ITEM_MATERIAL_BASE}/adamantite.webp`],
  ["orichalcum", `${ITEM_MATERIAL_BASE}/orichalcum.webp`],
  ["crystal_ore", `${ITEM_MATERIAL_BASE}/crystal_ore.webp`],
  ["crystal_ingot", `${ITEM_MATERIAL_BASE}/crystal_ingot.webp`],
  ["meteorite", `${ITEM_MATERIAL_BASE}/meteorite.webp`],
  ["ancient_coin", `${ITEM_MATERIAL_BASE}/ancient_coin.webp`],
  ["elemental_crystal", `${ITEM_MATERIAL_BASE}/elemental_crystal.webp`],
  ["wyvern_scale", `${ITEM_MATERIAL_BASE}/wyvern_scale.webp`],
  ["demon_horn", `${ITEM_MATERIAL_BASE}/demon_horn.webp`],
  ["tonberry_lantern", `${ITEM_MATERIAL_BASE}/tonberry_lantern.webp`],
  ["dragon_heart", `${ITEM_MATERIAL_BASE}/dragon_heart.webp`],
  ["holy_scale", `${ITEM_MATERIAL_BASE}/holy_scale.webp`],
  ["mimic_lock", `${ITEM_MATERIAL_BASE}/mimic_lock.webp`],
  ["archon_shard", `${ITEM_MATERIAL_BASE}/archon_shard.webp`],
  ["dark_matter", `${ITEM_MATERIAL_BASE}/dark_matter.webp`],
  ["omega_core", `${ITEM_MATERIAL_BASE}/omega_core.webp`],
  ["shinryu_scale", `${ITEM_MATERIAL_BASE}/shinryu_scale.webp`],

  // Existing shared material families remain in place for materials outside the current artwork waves.
  ["magitek_scrap", `${MATERIAL_METAL_BASE}/metal_scrap.webp`],
  ["iron_giant_plate", `${MATERIAL_METAL_BASE}/metal_bundle.webp`],
  ["ironclad_plate", `${MATERIAL_METAL_BASE}/darksteel_ore.webp`],
  ["warmech_component", `${MATERIAL_METAL_BASE}/metal_scrap.webp`],
  ["masamune_fragment", `${MATERIAL_METAL_BASE}/silver_ingots.webp`],
  ["genji_token", `${MATERIAL_METAL_BASE}/gold_ingots.webp`],
  ["goblin_medallion", `${MATERIAL_METAL_BASE}/copper_ingots.webp`],
  ["gigas_brace", `${MATERIAL_METAL_BASE}/metal_bundle.webp`],
  ["bomb_core", `${ELEMENTAL_CRYSTAL_BASE}/fire.webp`],
  ["summoners_ember", `${ELEMENTAL_CRYSTAL_BASE}/fire.webp`],
  ["glacial_crystal", `${ELEMENTAL_CRYSTAL_BASE}/ice.webp`],
  ["judgment_spark", `${ELEMENTAL_CRYSTAL_BASE}/lightning.webp`],
  ["earth_heart", `${ELEMENTAL_CRYSTAL_BASE}/earth.webp`],
  ["gale_feather", `${ELEMENTAL_CRYSTAL_BASE}/wind.webp`],
  ["tidal_scale", `${ELEMENTAL_CRYSTAL_BASE}/water.webp`],
  ["crystal_shard", `${ELEMENTAL_CRYSTAL_BASE}/light.webp`],
  ["crystal_core", `${ELEMENTAL_CRYSTAL_BASE}/light.webp`],
  ["eidolon_shard", `${ELEMENTAL_CRYSTAL_BASE}/light.webp`],
  ["absolute_crystal", `${ELEMENTAL_CRYSTAL_BASE}/light.webp`],
  ["magic_pot_shard", `${ELEMENTAL_CRYSTAL_BASE}/light.webp`],
  ["magitek_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["mover_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["ultima_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["penance_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["proto_babil_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["rift_crystal", `${ELEMENTAL_CRYSTAL_BASE}/dark.webp`],
  ["void_essence", `${ELEMENTAL_CRYSTAL_BASE}/dark.webp`],
  ["demonolith_shard", `${ELEMENTAL_CRYSTAL_BASE}/dark.webp`],
  ["ozma_shard", `${ELEMENTAL_CRYSTAL_BASE}/dark.webp`],
]);

function normalizeItemId(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function itemType(item = {}) {
  return normalizeItemId(item.type || item.item_type || item.category || "");
}

export function itemArtworkTier(item = {}) {
  const raw = Number(item.min_level ?? item.shop_level ?? item.level ?? 1);
  const level = Number.isFinite(raw) && raw > 0 ? raw : 1;
  if (level >= 50) return 6;
  if (level >= 35) return 5;
  if (level >= 25) return 4;
  if (level >= 16) return 3;
  if (level >= 8) return 2;
  return 1;
}

function inferWeaponFamily(item = {}) {
  const direct = normalizeItemId(item.gear_family || item.weapon_family || "");
  if (WEAPON_FAMILIES.has(direct)) return direct;
  const name = normalizeItemId(item.name || item.id || item.item_id || "");
  const rules = [
    ["katana", /katana|osafune|kogarasu|kotetsu|kiyomori|ichimonji/],
    ["firearm", /pistol|revolver|musket|carbine|gun|rifle|blaster|cannon/],
    ["instrument", /harp|lyre|lute|flute|horn/],
    ["knuckles", /knuckle|cesti|claw|fist/],
    ["rapier", /rapier|foil|epee/],
    ["spear", /spear|lance|trident|halberd/],
    ["bow", /bow|artemis/],
    ["tome", /tome|book|codex|grimoire|wiyu/],
    ["noulith", /noulith|astral_codex/],
    ["staff", /staff|rod/],
    ["wand", /wand/],
    ["dagger", /dagger|knife|dirk|stiletto/],
    ["axe", /axe|cleaver/],
    ["sword", /sword|blade|saber|broadsword|longsword|tongue|icebrand/],
  ];
  return rules.find(([, pattern]) => pattern.test(name))?.[0] || "unrestricted";
}

function materialArtworkPath(item = {}) {
  const id = normalizeItemId(item.id || item.item_id || item.name || "");
  return MATERIAL_ART_BY_ID.get(id) || "";
}

function weaponArtworkPath(item = {}) {
  const id = normalizeItemId(item.id || item.item_id || item.name || "");
  const direct = WEAPON_ART_BY_ID.get(id);
  if (direct) return direct;
  const family = inferWeaponFamily(item);
  if (family === "unrestricted") return "";
  return `${WEAPON_FAMILY_BASE}/${family}.webp`;
}

function inferArmorFamily(item = {}) {
  const direct = normalizeItemId(item.gear_family || item.armor_family || "");
  if (["heavy", "robe", "coat", "light", "unrestricted"].includes(direct)) return direct;
  const name = normalizeItemId(item.name || item.id || item.item_id || "");
  if (/robe/.test(name)) return "robe";
  if (/coat|jacket|scale_/.test(name)) return "coat";
  if (/garb|vest|jerkin|weave/.test(name)) return "light";
  if (/plate|cuirass|armor|hauberk|chain|mail|aegis/.test(name)) return "heavy";
  return "unrestricted";
}

function armorArtworkPath(item = {}) {
  const family = inferArmorFamily(item);
  const id = normalizeItemId(item.id || item.item_id || item.name || "");
  if (family === "heavy") return `${EQUIPMENT_FAMILY_BASE}/armor_style_t2.webp`;
  if (family === "robe") {
    const healerStyle = /white|novice|cotton|linen|aether|scholar|oracle|sage/.test(id);
    return `${EQUIPMENT_FAMILY_BASE}/armor_style_t${healerStyle ? 4 : 5}.webp`;
  }
  if (family === "coat") return `${EQUIPMENT_FAMILY_BASE}/armor_style_t6.webp`;
  if (family === "light") return `${EQUIPMENT_FAMILY_BASE}/armor_style_t1.webp`;
  return `${EQUIPMENT_FAMILY_BASE}/armor_style_t3.webp`;
}

function accessoryArtworkPath(item = {}) {
  const id = normalizeItemId(item.id || item.item_id || item.name || "");
  const tier = itemArtworkTier(item);
  if (/boot|sandal/.test(id)) return `${EQUIPMENT_FAMILY_BASE}/boots_t${tier}.webp`;
  if (/belt|band|wrist/.test(id)) return `${EQUIPMENT_FAMILY_BASE}/belt_t${Math.min(tier, 4)}.webp`;
  if (/gauntlet|glove/.test(id)) return `${WEAPON_FAMILY_BASE}/knuckles.webp`;
  if (/crown/.test(id)) return `${WEAPON_ITEM_BASE}/${tier >= 5 ? "ice_crown" : "sapphire_circlet"}.webp`;
  if (/hammer/.test(id)) return `${WEAPON_ITEM_BASE}/steel_warhammer.webp`;
  if (/ring|pendant|charm|crest|emblem|focus|guard|eye/.test(id)) return `${EQUIPMENT_FAMILY_BASE}/ring_t${tier}.webp`;
  if (/goggle|blindfold/.test(id)) return `${WEAPON_ITEM_BASE}/rogue_hood.webp`;
  if (/ribbon/.test(id)) return `${EQUIPMENT_FAMILY_BASE}/belt_t4.webp`;
  return `${EQUIPMENT_FAMILY_BASE}/ring_t${tier}.webp`;
}

export function itemArtworkId(item = {}) {
  const direct = normalizeItemId(item.id || item.item_id || "");
  if (ITEM_ART_IDS.has(direct)) return direct;
  const fromName = normalizeItemId(item.name || "");
  return ITEM_ART_IDS.has(fromName) ? fromName : "";
}

export function itemArtworkPath(item = {}) {
  const direct = itemArtworkId(item);
  if (direct) return `${ITEM_ART_BASE}/${direct}.webp`;
  const type = itemType(item);
  if (type === "material") return materialArtworkPath(item);
  if (type === "weapon") return weaponArtworkPath(item);
  if (type === "armor") return armorArtworkPath(item);
  if (type === "accessory") return accessoryArtworkPath(item);
  return "";
}

export function hasItemArtwork(item = {}) {
  return Boolean(itemArtworkPath(item));
}
