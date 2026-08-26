const ITEM_ART_BASE = "/retro-phase-ii/item-icons-v1";
const MATERIAL_METAL_BASE = "/retro-phase-ii/material-metals-v1";
const ELEMENTAL_CRYSTAL_BASE = "/retro-phase-ii/elemental-crystals-v1";
const WEAPON_FAMILY_BASE = "/retro-phase-ii/weapon-families-v1";
const WEAPON_TIER_BASE = "/retro-phase-ii/weapon-tiers-v1";
const ARMOR_TIER_BASE = "/retro-phase-ii/armor-tiers-v1";
const ACCESSORY_FAMILY_BASE = "/retro-phase-ii/accessory-families-v1";

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
const TIERED_WEAPON_FAMILIES = new Set(["sword", "dagger", "axe", "staff"]);

const MATERIAL_ART_BY_ID = new Map([
  ["iron_ore", `${MATERIAL_METAL_BASE}/iron_ore.webp`],
  ["mythril_ore", `${MATERIAL_METAL_BASE}/mythril_ore.webp`],
  ["adamantite", `${MATERIAL_METAL_BASE}/rare_ore_cluster.webp`],
  ["magitek_scrap", `${MATERIAL_METAL_BASE}/metal_scrap.webp`],
  ["iron_giant_plate", `${MATERIAL_METAL_BASE}/metal_bundle.webp`],
  ["ironclad_plate", `${MATERIAL_METAL_BASE}/darksteel_ore.webp`],
  ["warmech_component", `${MATERIAL_METAL_BASE}/metal_scrap.webp`],
  ["masamune_fragment", `${MATERIAL_METAL_BASE}/silver_ingots.webp`],
  ["ancient_coin", `${MATERIAL_METAL_BASE}/mixed_ingots.webp`],
  ["genji_token", `${MATERIAL_METAL_BASE}/gold_ingots.webp`],
  ["goblin_medallion", `${MATERIAL_METAL_BASE}/copper_ingots.webp`],
  ["gigas_brace", `${MATERIAL_METAL_BASE}/metal_bundle.webp`],
  ["mimic_lock", `${MATERIAL_METAL_BASE}/gold_ingots.webp`],

  ["bomb_fragment", `${ELEMENTAL_CRYSTAL_BASE}/fire.webp`],
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
  ["elemental_crystal", `${ELEMENTAL_CRYSTAL_BASE}/light.webp`],
  ["absolute_crystal", `${ELEMENTAL_CRYSTAL_BASE}/light.webp`],
  ["magic_pot_shard", `${ELEMENTAL_CRYSTAL_BASE}/light.webp`],
  ["magitek_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["mover_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["ultima_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["omega_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["penance_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["proto_babil_core", `${MATERIAL_METAL_BASE}/star_crystal.webp`],
  ["rift_crystal", `${ELEMENTAL_CRYSTAL_BASE}/dark.webp`],
  ["dark_matter", `${ELEMENTAL_CRYSTAL_BASE}/dark.webp`],
  ["void_essence", `${ELEMENTAL_CRYSTAL_BASE}/dark.webp`],
  ["demonolith_shard", `${ELEMENTAL_CRYSTAL_BASE}/dark.webp`],
  ["ozma_shard", `${ELEMENTAL_CRYSTAL_BASE}/dark.webp`],
  ["archon_shard", `${ELEMENTAL_CRYSTAL_BASE}/dark.webp`],
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
  const family = inferWeaponFamily(item);
  if (TIERED_WEAPON_FAMILIES.has(family)) {
    return `${WEAPON_TIER_BASE}/${family}_t${itemArtworkTier(item)}.webp`;
  }
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
  const tier = itemArtworkTier(item);
  if (family === "heavy") return `${ARMOR_TIER_BASE}/plate_t${tier}.webp`;
  if (family === "robe") return `${ARMOR_TIER_BASE}/robe_t${tier}.webp`;
  if (family === "coat") return `${ACCESSORY_FAMILY_BASE}/armor_style_t6.webp`;
  if (family === "light") return `${ACCESSORY_FAMILY_BASE}/armor_style_t1.webp`;
  return `${ACCESSORY_FAMILY_BASE}/armor_style_t3.webp`;
}

function accessoryArtworkPath(item = {}) {
  const id = normalizeItemId(item.id || item.item_id || item.name || "");
  const tier = itemArtworkTier(item);
  if (/boot|sandal/.test(id)) return `${ACCESSORY_FAMILY_BASE}/boots_t${tier}.webp`;
  if (/belt|band|wrist/.test(id)) return `${ACCESSORY_FAMILY_BASE}/belt_t${tier}.webp`;
  if (/gauntlet|glove/.test(id)) return `${ARMOR_TIER_BASE}/gauntlets_t${tier}.webp`;
  if (/crown/.test(id)) return `${ARMOR_TIER_BASE}/helm_t${tier}.webp`;
  if (/hammer/.test(id)) return `${WEAPON_TIER_BASE}/hammer_t${tier}.webp`;
  if (/ring|pendant|charm|crest|emblem|focus|guard|eye/.test(id)) return `${ACCESSORY_FAMILY_BASE}/ring_t${tier}.webp`;
  if (/goggle|blindfold/.test(id)) return `${ARMOR_TIER_BASE}/helm_t1.webp`;
  if (/ribbon/.test(id)) return `${ACCESSORY_FAMILY_BASE}/belt_t4.webp`;
  return `${ACCESSORY_FAMILY_BASE}/ring_t${tier}.webp`;
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
