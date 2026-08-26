const ITEM_ART_BASE = "/retro-phase-ii/item-icons-v4";
const ITEM_MATERIAL_BASE = "/retro-phase-ii/item-materials-v5";
const MATERIAL_ITEM_BASE = "/retro-phase-iii/material-icons-v1";
const MATERIAL_METAL_BASE = "/retro-phase-ii/material-metals-v2";
const ELEMENTAL_CRYSTAL_BASE = "/retro-phase-ii/elemental-crystals-v2";
const WEAPON_ITEM_BASE = "/retro-phase-iii/weapon-icons-v1";
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
  "sword", "axe", "spear", "staff", "dagger", "katana", "knuckles", "firearm", "instrument", "rapier", "wand", "unrestricted",
]);

const WEAPON_ART_BY_ID = new Map([
  // CG-GEAR-R01 — Swords & Great Blades.
  ["iron_sword", `${WEAPON_ITEM_BASE}/iron_sword.png`],
  ["iron_blade", `${WEAPON_ITEM_BASE}/iron_sword.png`],
  ["steel_sword", `${WEAPON_ITEM_BASE}/steel_sword.png`],
  ["steel_longsword", `${WEAPON_ITEM_BASE}/steel_sword.png`],
  ["mythril_sword", `${WEAPON_ITEM_BASE}/mythril_sword.png`],
  ["flametongue", `${WEAPON_ITEM_BASE}/flametongue.png`],
  ["flame_tongue", `${WEAPON_ITEM_BASE}/flametongue.png`],
  ["icebrand", `${WEAPON_ITEM_BASE}/icebrand.png`],
  ["coral_sword", `${WEAPON_ITEM_BASE}/coral_sword.png`],
  ["blood_sword", `${WEAPON_ITEM_BASE}/blood_sword.png`],
  ["defender", `${WEAPON_ITEM_BASE}/defender.png`],
  ["defender_blade", `${WEAPON_ITEM_BASE}/defender.png`],
  ["excalibur", `${WEAPON_ITEM_BASE}/excalibur.png`],
  ["excalibur_dormant", `${WEAPON_ITEM_BASE}/excalibur.png`],
  ["excalibur_awakened", `${WEAPON_ITEM_BASE}/excalibur.png`],
  ["excalibur_zenith", `${WEAPON_ITEM_BASE}/excalibur.png`],
  ["ragnarok", `${WEAPON_ITEM_BASE}/ragnarok.png`],

  // CG-GEAR-R02 — Daggers, Rapiers & Rogue Weapons.
  ["knife", `${WEAPON_ITEM_BASE}/knife.png`],
  ["dagger", `${WEAPON_ITEM_BASE}/dagger.png`],
  ["bronze_dagger", `${WEAPON_ITEM_BASE}/dagger.png`],
  ["mythril_knife", `${WEAPON_ITEM_BASE}/mythril_knife.png`],
  ["mythril_dagger", `${WEAPON_ITEM_BASE}/mythril_knife.png`],
  ["mage_masher", `${WEAPON_ITEM_BASE}/mage_masher.png`],
  ["poison_fang", `${WEAPON_ITEM_BASE}/poison_fang.png`],
  ["main_gauche", `${WEAPON_ITEM_BASE}/main_gauche.png`],
  ["assassins_dagger", `${WEAPON_ITEM_BASE}/assassins_dagger.png`],
  ["rapier", `${WEAPON_ITEM_BASE}/rapier.png`],
  ["copper_rapier", `${WEAPON_ITEM_BASE}/rapier.png`],
  ["rune_blade", `${WEAPON_ITEM_BASE}/rune_blade.png`],
  ["ultima_blade", `${WEAPON_ITEM_BASE}/ultima_blade.png`],

  // CG-GEAR-R03 — Axes, Hammers & Heavy Weapons.
  ["battle_axe", `${WEAPON_ITEM_BASE}/battle_axe.png`],
  ["hunters_axe", `${WEAPON_ITEM_BASE}/battle_axe.png`],
  ["ornate_battle_axe", `${WEAPON_ITEM_BASE}/ornate_battle_axe.png`],
  ["bronze_waraxe", `${WEAPON_ITEM_BASE}/ornate_battle_axe.png`],
  ["froststeel_greataxe", `${WEAPON_ITEM_BASE}/froststeel_greataxe.png`],
  ["iron_waraxe", `${WEAPON_ITEM_BASE}/froststeel_greataxe.png`],
  ["crescent_greataxe", `${WEAPON_ITEM_BASE}/crescent_greataxe.png`],
  ["steel_greataxe", `${WEAPON_ITEM_BASE}/crescent_greataxe.png`],
  ["mythril_crescent_axe", `${WEAPON_ITEM_BASE}/mythril_crescent_axe.png`],
  ["mythril_greataxe", `${WEAPON_ITEM_BASE}/mythril_crescent_axe.png`],
  ["ogrekiller", `${WEAPON_ITEM_BASE}/ogrekiller.png`],
  ["ogre_cleaver", `${WEAPON_ITEM_BASE}/ogrekiller.png`],
  ["ogre_axe", `${WEAPON_ITEM_BASE}/ogrekiller.png`],
  ["runic_frostfire_axe", `${WEAPON_ITEM_BASE}/runic_frostfire_axe.png`],
  ["rune_axe", `${WEAPON_ITEM_BASE}/runic_frostfire_axe.png`],
  ["steel_warhammer", `${WEAPON_ITEM_BASE}/steel_warhammer.png`],
  ["mythril_hammer", `${WEAPON_ITEM_BASE}/mythril_hammer.png`],
  ["earthshaker_hammer", `${WEAPON_ITEM_BASE}/earthshaker_hammer.png`],

  // CG-GEAR-R04 — Spears & Polearms.
  ["spear", `${WEAPON_ITEM_BASE}/spear.png`],
  ["training_spear", `${WEAPON_ITEM_BASE}/spear.png`],
  ["javelin", `${WEAPON_ITEM_BASE}/javelin.png`],
  ["mythril_spear", `${WEAPON_ITEM_BASE}/mythril_spear.png`],
  ["mythril_lance", `${WEAPON_ITEM_BASE}/mythril_spear.png`],
  ["trident", `${WEAPON_ITEM_BASE}/trident.png`],
  ["coral_trident", `${WEAPON_ITEM_BASE}/trident.png`],
  ["partisan", `${WEAPON_ITEM_BASE}/partisan.png`],
  ["ice_lance", `${WEAPON_ITEM_BASE}/ice_lance.png`],
  ["holy_lance", `${WEAPON_ITEM_BASE}/holy_lance.png`],
  ["dragon_lance", `${WEAPON_ITEM_BASE}/dragon_lance.png`],
  ["dragon_spear", `${WEAPON_ITEM_BASE}/dragon_lance.png`],
  ["dragonbone_spear", `${WEAPON_ITEM_BASE}/dragon_lance.png`],
  ["wyvern_spear", `${WEAPON_ITEM_BASE}/dragon_lance.png`],
  ["wyvern_lance", `${WEAPON_ITEM_BASE}/dragon_lance.png`],
  ["gungnir", `${WEAPON_ITEM_BASE}/gungnir.png`],
  ["gungnir_fragment", `${WEAPON_ITEM_BASE}/gungnir.png`],
  ["longinus", `${WEAPON_ITEM_BASE}/longinus.png`],

  // CG-GEAR-R05 — Staves, Rods & Mage Weapons.
  ["oak_staff", `${WEAPON_ITEM_BASE}/oak_staff.png`],
  ["elm_staff", `${WEAPON_ITEM_BASE}/elm_staff.png`],
  ["rune_staff", `${WEAPON_ITEM_BASE}/rune_staff.png`],
  ["silver_staff", `${WEAPON_ITEM_BASE}/silver_staff.png`],
  ["priests_staff", `${WEAPON_ITEM_BASE}/priests_staff.png`],
  ["fire_rod", `${WEAPON_ITEM_BASE}/fire_rod.png`],
  ["frost_rod", `${WEAPON_ITEM_BASE}/frost_rod.png`],
  ["thunder_rod", `${WEAPON_ITEM_BASE}/thunder_rod.png`],
  ["elemental_staff", `${WEAPON_ITEM_BASE}/elemental_staff.png`],
  ["high_mage_staff", `${WEAPON_ITEM_BASE}/elemental_staff.png`],
  ["wizard_rod", `${WEAPON_ITEM_BASE}/rune_staff.png`],
  ["magus_staff", `${WEAPON_ITEM_BASE}/astral_staff.png`],
  ["astral_staff", `${WEAPON_ITEM_BASE}/astral_staff.png`],
  ["sage_staff", `${WEAPON_ITEM_BASE}/priests_staff.png`],
  ["sage_rod", `${WEAPON_ITEM_BASE}/priests_staff.png`],
  ["astral_rod", `${WEAPON_ITEM_BASE}/astral_staff.png`],
  ["nirvana_dormant", `${WEAPON_ITEM_BASE}/priests_staff.png`],
  ["nirvana_awakened", `${WEAPON_ITEM_BASE}/astral_staff.png`],
  ["nirvana_zenith", `${WEAPON_ITEM_BASE}/astral_staff.png`],
  ["stardust_rod_dormant", `${WEAPON_ITEM_BASE}/rune_staff.png`],
  ["stardust_rod_awakened", `${WEAPON_ITEM_BASE}/elemental_staff.png`],
  ["stardust_rod_zenith", `${WEAPON_ITEM_BASE}/astral_staff.png`],

  // CG-GEAR-R06 — Bows & Ranged Weapons.
  ["shortbow", `${WEAPON_ITEM_BASE}/shortbow.png`],
  ["longbow", `${WEAPON_ITEM_BASE}/longbow.png`],
  ["great_bow", `${WEAPON_ITEM_BASE}/great_bow.png`],
  ["killer_bow", `${WEAPON_ITEM_BASE}/killer_bow.png`],
  ["elven_bow", `${WEAPON_ITEM_BASE}/elven_bow.png`],
  ["rune_bow", `${WEAPON_ITEM_BASE}/rune_bow.png`],
  ["yoichi_bow", `${WEAPON_ITEM_BASE}/yoichi_bow.png`],
  ["hunting_rifle", `${WEAPON_ITEM_BASE}/hunting_rifle.png`],
  ["magitek_rifle", `${WEAPON_ITEM_BASE}/magitek_rifle.png`],
  ["artemis_bow", `${WEAPON_ITEM_BASE}/artemis_bow.png`],

  // CG-GEAR-R07 — Katana & Samurai Weapons.
  ["ashigaru_katana", `${WEAPON_ITEM_BASE}/ashigaru_katana.png`],
  ["iron_katana", `${WEAPON_ITEM_BASE}/iron_katana.png`],
  ["steel_katana", `${WEAPON_ITEM_BASE}/steel_katana.png`],
  ["osafune", `${WEAPON_ITEM_BASE}/osafune.png`],
  ["kogarasu", `${WEAPON_ITEM_BASE}/kogarasu.png`],
  ["kotetsu", `${WEAPON_ITEM_BASE}/kotetsu.png`],
  ["kiyomori", `${WEAPON_ITEM_BASE}/kiyomori.png`],
  ["genji_katana", `${WEAPON_ITEM_BASE}/genji_katana.png`],
  ["kiku_ichimonji", `${WEAPON_ITEM_BASE}/kiku_ichimonji.png`],
  ["heavens_cloud", `${WEAPON_ITEM_BASE}/heavens_cloud.png`],
  ["ronin_katana", `${WEAPON_ITEM_BASE}/steel_katana.png`],
  ["murasame", `${WEAPON_ITEM_BASE}/osafune.png`],
  ["murakumo", `${WEAPON_ITEM_BASE}/heavens_cloud.png`],
  ["ame_no_murakumo", `${WEAPON_ITEM_BASE}/heavens_cloud.png`],
  ["masamune_dormant", `${WEAPON_ITEM_BASE}/kiyomori.png`],
  ["masamune_awakened", `${WEAPON_ITEM_BASE}/genji_katana.png`],
  ["masamune_zenith", `${WEAPON_ITEM_BASE}/heavens_cloud.png`],

  // CG-GEAR-R08 — Knuckles, Cesti & Claws.
  ["leather_knuckles", `${WEAPON_ITEM_BASE}/leather_knuckles.png`],
  ["brass_knuckles", `${WEAPON_ITEM_BASE}/brass_knuckles.png`],
  ["iron_knuckles", `${WEAPON_ITEM_BASE}/iron_knuckles.png`],
  ["steel_cesti", `${WEAPON_ITEM_BASE}/steel_cesti.png`],
  ["tiger_cesti", `${WEAPON_ITEM_BASE}/tiger_cesti.png`],
  ["mythril_claws", `${WEAPON_ITEM_BASE}/mythril_claws.png`],
  ["mythril_knuckles", `${WEAPON_ITEM_BASE}/mythril_claws.png`],
  ["wyvern_claws", `${WEAPON_ITEM_BASE}/wyvern_claws.png`],
  ["diamond_knuckles", `${WEAPON_ITEM_BASE}/diamond_knuckles.png`],
  ["tiger_fangs", `${WEAPON_ITEM_BASE}/tiger_cesti.png`],
  ["demon_claws", `${WEAPON_ITEM_BASE}/demon_claws.png`],
  ["hell_claws", `${WEAPON_ITEM_BASE}/demon_claws.png`],
  ["dragon_claws", `${WEAPON_ITEM_BASE}/wyvern_claws.png`],
  ["kaiser_knuckles", `${WEAPON_ITEM_BASE}/godhand.png`],
  ["godhand_dormant", `${WEAPON_ITEM_BASE}/godhand.png`],
  ["godhand_awakened", `${WEAPON_ITEM_BASE}/godhand.png`],
  ["godhand_zenith", `${WEAPON_ITEM_BASE}/godhand.png`],

  // CG-GEAR-R09 — Wands, Scepters & Focuses.
  ["ash_wand", `${WEAPON_ITEM_BASE}/ash_wand.png`],
  ["willow_wand", `${WEAPON_ITEM_BASE}/willow_wand.png`],
  ["yew_wand", `${WEAPON_ITEM_BASE}/yew_wand.png`],
  ["silver_wand", `${WEAPON_ITEM_BASE}/silver_wand.png`],
  ["rune_wand", `${WEAPON_ITEM_BASE}/rune_wand.png`],
  ["mythril_wand", `${WEAPON_ITEM_BASE}/mythril_wand.png`],
  ["sages_wand", `${WEAPON_ITEM_BASE}/sages_wand.png`],
  ["crystal_wand", `${WEAPON_ITEM_BASE}/crystal_wand.png`],
  ["starfall_wand", `${WEAPON_ITEM_BASE}/starfall_wand.png`],
  ["stardust_wand", `${WEAPON_ITEM_BASE}/stardust_wand.png`],
  ["magus_wand", `${WEAPON_ITEM_BASE}/starfall_wand.png`],
  ["mystic_wand", `${WEAPON_ITEM_BASE}/rune_wand.png`],

  // CG-GEAR-R10 — Harps & Bard Instruments.
  ["travelers_harp", `${WEAPON_ITEM_BASE}/travelers_harp.png`],
  ["maple_harp", `${WEAPON_ITEM_BASE}/maple_harp.png`],
  ["silver_harp", `${WEAPON_ITEM_BASE}/silver_harp.png`],
  ["rosewood_harp", `${WEAPON_ITEM_BASE}/rosewood_harp.png`],
  ["faerie_harp", `${WEAPON_ITEM_BASE}/faerie_harp.png`],
  ["dream_harp", `${WEAPON_ITEM_BASE}/dream_harp.png`],
  ["siren_harp", `${WEAPON_ITEM_BASE}/siren_harp.png`],
  ["rune_harp", `${WEAPON_ITEM_BASE}/rune_harp.png`],
  ["lamia_harp", `${WEAPON_ITEM_BASE}/lamia_harp.png`],
  ["apollo_harp", `${WEAPON_ITEM_BASE}/apollo_harp.png`],
  ["seraph_harp", `${WEAPON_ITEM_BASE}/apollo_harp.png`],
  ["celestial_harp", `${WEAPON_ITEM_BASE}/dream_harp.png`],
  ["minstrels_harp", `${WEAPON_ITEM_BASE}/rosewood_harp.png`],

  // CG-GEAR-R11 — Whips, Chains & Flails.
  ["leather_whip", `${WEAPON_ITEM_BASE}/leather_whip.png`],
  ["spiked_chain", `${WEAPON_ITEM_BASE}/spiked_chain.png`],
  ["thorn_whip", `${WEAPON_ITEM_BASE}/thorn_whip.png`],
  ["flame_whip", `${WEAPON_ITEM_BASE}/flame_whip.png`],
  ["frost_whip", `${WEAPON_ITEM_BASE}/frost_whip.png`],
  ["lightning_whip", `${WEAPON_ITEM_BASE}/lightning_whip.png`],
  ["venom_whip", `${WEAPON_ITEM_BASE}/venom_whip.png`],
  ["morbol_lash", `${WEAPON_ITEM_BASE}/venom_whip.png`],
  ["royal_flail", `${WEAPON_ITEM_BASE}/royal_flail.png`],
  ["morning_star", `${WEAPON_ITEM_BASE}/morning_star.png`],
  ["dragonfire_whip", `${WEAPON_ITEM_BASE}/dragonfire_whip.png`],

  // CG-GEAR-R12 — Firearms & Magitek Weapons.
  ["copper_pistol", `${WEAPON_ITEM_BASE}/copper_pistol.png`],
  ["iron_pistol", `${WEAPON_ITEM_BASE}/iron_pistol.png`],
  ["flintlock_pistol", `${WEAPON_ITEM_BASE}/flintlock_pistol.png`],
  ["steel_revolver", `${WEAPON_ITEM_BASE}/steel_revolver.png`],
  ["mythril_revolver", `${WEAPON_ITEM_BASE}/mythril_revolver.png`],
  ["mythril_musket", `${WEAPON_ITEM_BASE}/mythril_musket.png`],
  ["magitek_pistol", `${WEAPON_ITEM_BASE}/magitek_pistol.png`],
  ["cerulean_rifle", `${WEAPON_ITEM_BASE}/cerulean_rifle.png`],
  ["machina_repeater", `${WEAPON_ITEM_BASE}/machina_repeater.png`],
  ["magitek_hand_cannon", `${WEAPON_ITEM_BASE}/magitek_hand_cannon.png`],
  ["magitek_cannon", `${WEAPON_ITEM_BASE}/magitek_hand_cannon.png`],
  ["aether_carbine", `${WEAPON_ITEM_BASE}/cerulean_rifle.png`],
  ["cerberus_carbine", `${WEAPON_ITEM_BASE}/magitek_hand_cannon.png`],
  ["mythril_repeater", `${WEAPON_ITEM_BASE}/mythril_musket.png`],

  // CG-GEAR-R13 — Grimoires & Spellbooks.
  ["arcane_grimoire", `${WEAPON_ITEM_BASE}/arcane_grimoire.png`],
  ["enchanted_grimoire", `${WEAPON_ITEM_BASE}/enchanted_grimoire.png`],
  ["rubybound_grimoire", `${WEAPON_ITEM_BASE}/rubybound_grimoire.png`],
  ["frostbound_grimoire", `${WEAPON_ITEM_BASE}/frostbound_grimoire.png`],
  ["inferno_grimoire", `${WEAPON_ITEM_BASE}/inferno_grimoire.png`],
  ["stormbound_grimoire", `${WEAPON_ITEM_BASE}/stormbound_grimoire.png`],
  ["holy_grimoire", `${WEAPON_ITEM_BASE}/holy_grimoire.png`],
  ["shadow_grimoire", `${WEAPON_ITEM_BASE}/shadow_grimoire.png`],
  ["starfall_grimoire", `${WEAPON_ITEM_BASE}/starfall_grimoire.png`],
  ["astral_grimoire", `${WEAPON_ITEM_BASE}/astral_grimoire.png`],
]);

const MATERIAL_ART_BY_ID = new Map([
  // CG-MAT-R01 — verified monster-drop material identities.
  ["wolf_fang", `${MATERIAL_ITEM_BASE}/wolf_fang.png`],
  ["cactuar_needle", `${MATERIAL_ITEM_BASE}/cactuar_needle.png`],
  ["bone_chip", `${MATERIAL_ITEM_BASE}/bone_chip.png`],
  ["fish_scale", `${MATERIAL_ITEM_BASE}/fish_scale.png`],
  ["coeurl_whisker", `${MATERIAL_ITEM_BASE}/coeurl_whisker.png`],
  ["chimera_scale", `${MATERIAL_ITEM_BASE}/chimera_scale.png`],
  ["malboro_tendril", `${MATERIAL_ITEM_BASE}/malboro_tendril.png`],
  ["behemoth_horn", `${MATERIAL_ITEM_BASE}/behemoth_horn.png`],
  ["bomb_kings_fuse", `${MATERIAL_ITEM_BASE}/bomb_kings_fuse.png`],
  ["morbol_bulb", `${MATERIAL_ITEM_BASE}/morbol_bulb.png`],

  // CG-MAT-R03 — verified hunt and boss material identities.
  ["antlion_mandible", `${MATERIAL_ITEM_BASE}/antlion_mandible.png`],
  ["sandworm_fang", `${MATERIAL_ITEM_BASE}/sandworm_fang.png`],
  ["garuda_feather", `${MATERIAL_ITEM_BASE}/garuda_feather.png`],
  ["death_claw_pincer", `${MATERIAL_ITEM_BASE}/death_claw_pincer.png`],
  ["dragon_fang", `${MATERIAL_ITEM_BASE}/dragon_fang.png`],
  ["ultros_tentacle", `${MATERIAL_ITEM_BASE}/ultros_tentacle.png`],
  ["demon_wall_fragment", `${MATERIAL_ITEM_BASE}/demon_wall_fragment.png`],
  ["deathgaze_plume", `${MATERIAL_ITEM_BASE}/deathgaze_plume.png`],
  ["earth_harp", `${MATERIAL_ITEM_BASE}/earth_harp.png`],
  ["desert_rose", `${MATERIAL_ITEM_BASE}/desert_rose.png`],
  // CG-MAT-R02 — verified material identities.
  ["triple_chimera_fang", `${MATERIAL_ITEM_BASE}/triple_chimera_fang.png`],
  ["dragon_scale", `${MATERIAL_ITEM_BASE}/dragon_scale.png`],
  ["ancient_cloth", `${MATERIAL_ITEM_BASE}/ancient_cloth.png`],
  ["celestial_thread", `${MATERIAL_ITEM_BASE}/celestial_thread.png`],
  ["imp_wing", `${MATERIAL_ITEM_BASE}/imp_wing.png`],
  ["cockatrice_pinion", `${MATERIAL_ITEM_BASE}/cockatrice_pinion.png`],
  ["ochu_vine", `${MATERIAL_ITEM_BASE}/ochu_vine.png`],
  ["basilisk_eye", `${MATERIAL_ITEM_BASE}/basilisk_eye.png`],
  ["lamia_scale", `${MATERIAL_ITEM_BASE}/lamia_scale.png`],
  ["mindflayer_tentacle", `${MATERIAL_ITEM_BASE}/mindflayer_tentacle.png`],

  // CG-MAT-R04 — verified rare/endgame/special material identities.
  ["nemesis_mark", `${MATERIAL_ITEM_BASE}/nemesis_mark.png`],
  ["yiazmat_scale", `${MATERIAL_ITEM_BASE}/yiazmat_scale.png`],
  ["kaiser_scale", `${MATERIAL_ITEM_BASE}/kaiser_scale.png`],
  ["long_gui_plate", `${MATERIAL_ITEM_BASE}/long_gui_plate.png`],
  ["ahriman_lens", `${MATERIAL_ITEM_BASE}/ahriman_lens.png`],
  ["morbol_spore", `${MATERIAL_ITEM_BASE}/morbol_spore.png`],
  ["magitek_capacitor", `${MATERIAL_ITEM_BASE}/magitek_capacitor.png`],
  ["behemoth_hide", `${MATERIAL_ITEM_BASE}/behemoth_hide.png`],
  ["chocobo_writ", `${MATERIAL_ITEM_BASE}/chocobo_writ.png`],

  // CG-ITEM-R03 through R06: regenerated SNES-style individual PNG identities.
  ["bomb_fragment", `${ITEM_MATERIAL_BASE}/bomb_fragment.png`],
  ["iron_ore", `${ITEM_MATERIAL_BASE}/iron_ore.png`],
  ["copper_ore", `${ITEM_MATERIAL_BASE}/copper_ore.png`],
  ["bronze_ingot", `${ITEM_MATERIAL_BASE}/bronze_ingot.png`],
  ["iron_ingot", `${ITEM_MATERIAL_BASE}/iron_ingot.png`],
  ["steel_ingot", `${ITEM_MATERIAL_BASE}/steel_ingot.png`],
  ["silver_ore", `${ITEM_MATERIAL_BASE}/silver_ore.png`],
  ["silver_ingot", `${ITEM_MATERIAL_BASE}/silver_ingot.png`],
  ["gold_ore", `${ITEM_MATERIAL_BASE}/gold_ore.png`],
  ["gold_ingot", `${ITEM_MATERIAL_BASE}/gold_ingot.png`],
  ["mythril_ore", `${ITEM_MATERIAL_BASE}/mythril_ore.png`],
  ["mythril_ingot", `${ITEM_MATERIAL_BASE}/mythril_ingot.png`],
  ["darksteel_ore", `${ITEM_MATERIAL_BASE}/darksteel_ore.png`],
  ["darksteel_ingot", `${ITEM_MATERIAL_BASE}/darksteel_ingot.png`],
  ["adamantite", `${ITEM_MATERIAL_BASE}/adamantite.png`],
  ["orichalcum", `${ITEM_MATERIAL_BASE}/orichalcum.png`],
  ["crystal_ore", `${ITEM_MATERIAL_BASE}/crystal_ore.png`],
  ["crystal_ingot", `${ITEM_MATERIAL_BASE}/crystal_ingot.png`],
  ["meteorite", `${ITEM_MATERIAL_BASE}/meteorite.png`],
  ["ancient_coin", `${ITEM_MATERIAL_BASE}/ancient_coin.png`],
  ["elemental_crystal", `${ITEM_MATERIAL_BASE}/elemental_crystal.png`],
  ["wyvern_scale", `${ITEM_MATERIAL_BASE}/wyvern_scale.png`],
  ["demon_horn", `${ITEM_MATERIAL_BASE}/demon_horn.png`],
  ["tonberry_lantern", `${ITEM_MATERIAL_BASE}/tonberry_lantern.png`],
  ["dragon_heart", `${ITEM_MATERIAL_BASE}/dragon_heart.png`],
  ["holy_scale", `${ITEM_MATERIAL_BASE}/holy_scale.png`],
  ["mimic_lock", `${ITEM_MATERIAL_BASE}/mimic_lock.png`],
  ["archon_shard", `${ITEM_MATERIAL_BASE}/archon_shard.png`],
  ["dark_matter", `${ITEM_MATERIAL_BASE}/dark_matter.png`],
  ["omega_core", `${ITEM_MATERIAL_BASE}/omega_core.png`],
  ["shinryu_scale", `${ITEM_MATERIAL_BASE}/shinryu_scale.png`],

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
  return `${WEAPON_FAMILY_BASE}/${family}.png`;
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
  if (/gauntlet|glove/.test(id)) return `${WEAPON_FAMILY_BASE}/knuckles.png`;
  if (/crown/.test(id)) return `${WEAPON_ITEM_BASE}/${tier >= 5 ? "ice_crown" : "sapphire_circlet"}.png`;
  if (/hammer/.test(id)) return `${WEAPON_ITEM_BASE}/steel_warhammer.png`;
  if (/ring|pendant|charm|crest|emblem|focus|guard|eye/.test(id)) return `${EQUIPMENT_FAMILY_BASE}/ring_t${tier}.webp`;
  if (/goggle|blindfold/.test(id)) return `${WEAPON_ITEM_BASE}/rogue_hood.png`;
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
  if (direct) return `${ITEM_ART_BASE}/${direct}.png`;
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
