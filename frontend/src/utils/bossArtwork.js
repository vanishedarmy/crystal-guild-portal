const BOSS_ART_BASE = "/retro-phase-ii/boss-art-v1";

export const BOSS_ART_IDS = new Set([
  "goblin_king",
  "hornet_empress",
  "skeleton_warlord",
  "gigas_chief",
  "bomb_king",
  "ifrit",
  "shiva",
  "ramuh",
  "ultros",
  "garuda_prime",
  "titan",
  "demon_wall",
  "leviathan",
  "gilgamesh",
  "cerberus",
  "tonberry_king",
  "deathgaze",
  "atomos",
  "king_behemoth",
  "bahamut",
  "death_machine_prime",
  "ultima_weapon",
  "rift_dragon",
  "warmech",
  "omega",
  "shinryu",
  "omega_weapon",
  "emerald_weapon",
  "ruby_weapon",
  "ozma",
  "nemesis",
  "kaiser_dragon",
  "long_gui",
  "proto_babil",
  "penance",
  "absolute_virtue",
  "yiazmat",
]);

const BOSS_ART_BY_NAME = new Map([
  ["goblin king", "goblin_king"],
  ["hornet empress", "hornet_empress"],
  ["skeleton warlord", "skeleton_warlord"],
  ["gigas chief", "gigas_chief"],
  ["bomb king", "bomb_king"],
  ["ifrit", "ifrit"],
  ["shiva", "shiva"],
  ["ramuh", "ramuh"],
  ["ultros", "ultros"],
  ["garuda", "garuda_prime"],
  ["garuda prime", "garuda_prime"],
  ["titan", "titan"],
  ["demon wall", "demon_wall"],
  ["leviathan", "leviathan"],
  ["gilgamesh", "gilgamesh"],
  ["cerberus", "cerberus"],
  ["tonberry king", "tonberry_king"],
  ["deathgaze", "deathgaze"],
  ["atomos", "atomos"],
  ["king behemoth", "king_behemoth"],
  ["behemoth king", "king_behemoth"],
  ["bahamut", "bahamut"],
  ["death machine prime", "death_machine_prime"],
  ["ultima weapon", "ultima_weapon"],
  ["rift dragon", "rift_dragon"],
  ["warmech", "warmech"],
  ["omega", "omega"],
  ["shinryu", "shinryu"],
  ["omega weapon", "omega_weapon"],
  ["emerald weapon", "emerald_weapon"],
  ["ruby weapon", "ruby_weapon"],
  ["ozma", "ozma"],
  ["nemesis", "nemesis"],
  ["kaiser dragon", "kaiser_dragon"],
  ["long gui", "long_gui"],
  ["proto-babil", "proto_babil"],
  ["proto babil", "proto_babil"],
  ["penance", "penance"],
  ["absolute virtue", "absolute_virtue"],
  ["yiazmat", "yiazmat"],
]);

function normalizeBossName(value = "") {
  return String(value).trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

export function bossArtworkId(boss = {}) {
  const rawId = String(boss?.id || "").trim().toLowerCase();
  if (BOSS_ART_IDS.has(rawId)) return rawId;
  return BOSS_ART_BY_NAME.get(normalizeBossName(boss?.name || boss)) || null;
}

export function bossArtworkPath(boss = {}) {
  const id = bossArtworkId(boss);
  return id ? `${BOSS_ART_BASE}/${id}.webp` : "";
}
