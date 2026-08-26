const ITEM_ART_BASE = "/retro-phase-ii/item-icons-v1";

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

function normalizeItemId(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function itemArtworkId(item = {}) {
  const direct = normalizeItemId(item.id || item.item_id || "");
  if (ITEM_ART_IDS.has(direct)) return direct;
  const fromName = normalizeItemId(item.name || "");
  return ITEM_ART_IDS.has(fromName) ? fromName : "";
}

export function itemArtworkPath(item = {}) {
  const id = itemArtworkId(item);
  return id ? `${ITEM_ART_BASE}/${id}.webp` : "";
}

export function hasItemArtwork(item = {}) {
  return Boolean(itemArtworkId(item));
}
