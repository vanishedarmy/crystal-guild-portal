const MONSTER_PORTRAITS = {
  goblin: "/retro-phase-ii/monster-portraits-v4/goblin.webp",
  wolf: "/retro-phase-ii/monster-portraits-v4/wolf.webp",
  mandragora: "/retro-phase-ii/monster-portraits-v4/mandragora.webp",
  goblin_chieftain: "/retro-phase-ii/monster-portraits-v4/goblin_chieftain.webp",
  goblin_guard: "/retro-phase-ii/monster-portraits-v4/goblin_guard.webp",
  hornet: "/retro-phase-ii/monster-portraits-v4/hornet.webp",
  flan: "/retro-phase-ii/monster-portraits-v4/flan.webp",
  imp: "/retro-phase-ii/monster-portraits-v4/imp.webp",
  dire_wolf_alpha: "/retro-phase-ii/monster-portraits-v4/dire_wolf_alpha.webp",
  bomb: "/retro-phase-ii/monster-portraits-v4/bomb.webp",
  cockatrice: "/retro-phase-ii/monster-portraits-v4/cockatrice.webp",
  bat: "/retro-phase-ii/monster-portraits-v4/bat.webp",
  queen_hornet: "/retro-phase-ii/monster-portraits-v4/queen_hornet.webp",
  ochu: "/retro-phase-ii/monster-portraits-v4/ochu.webp",
  skeleton: "/retro-phase-ii/monster-portraits-v4/skeleton.webp",
  cactuar: "/retro-phase-ii/monster-portraits-v4/cactuar.webp",
  ossuary_knight: "/retro-phase-ii/monster-portraits-v4/ossuary_knight.webp",
  spriggan: "/retro-phase-ii/monster-portraits-v4/spriggan.webp",
  basilisk: "/retro-phase-ii/monster-portraits-v4/basilisk.webp",
  crimson_detonator: "/retro-phase-ii/monster-portraits-v4/crimson_detonator.webp",
  gigas: "/retro-phase-ii/monster-portraits-v4/gigas.webp",
  lamia: "/retro-phase-ii/monster-portraits-v4/lamia.webp",
  mimic: "/retro-phase-ii/monster-portraits-v4/mimic.webp",
  gargoyle: "/retro-phase-ii/monster-portraits-v4/gargoyle.webp",
  sahagin: "/retro-phase-ii/monster-portraits-v4/sahagin.webp",
  sahagin_prince: "/retro-phase-ii/monster-portraits-v4/sahagin_prince.webp",
  tonberry: "/retro-phase-ii/monster-portraits-v4/tonberry.webp",
  killer_fish: "/retro-phase-ii/monster-portraits-v4/killer_fish.webp",
  cactuar_jack: "/retro-phase-ii/monster-portraits-v4/cactuar_jack.webp",
  gigantoad: "/retro-phase-ii/monster-portraits-v4/gigantoad.webp",
  mindflayer: "/retro-phase-ii/monster-portraits-v4/mindflayer.webp",
  zu: "/retro-phase-ii/monster-portraits-v4/zu.webp",
  antlion: "/retro-phase-ii/monster-portraits-v4/antlion.webp",
  piscodemon: "/retro-phase-ii/monster-portraits-v4/piscodemon.webp",
  black_flan: "/retro-phase-ii/monster-portraits-v4/black_flan.webp",
  coeurl: "/retro-phase-ii/monster-portraits-v4/coeurl.webp",
  sand_worm: "/retro-phase-ii/monster-portraits-v4/sand_worm.webp",
  chimera: "/retro-phase-ii/monster-portraits-v4/chimera.webp",
  remora: "/retro-phase-ii/monster-portraits-v4/remora.webp",
  king_coeurl: "/retro-phase-ii/monster-portraits-v4/king_coeurl.webp",
};

export function normalizeMonsterId(monster) {
  const raw = typeof monster === "string" ? monster : monster?.id;
  return String(raw || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function monsterPortraitPath(monster) {
  return MONSTER_PORTRAITS[normalizeMonsterId(monster)] || "";
}

export function hasMonsterPortrait(monster) {
  return Boolean(monsterPortraitPath(monster));
}

export function monsterPortraitEntries() {
  return Object.entries(MONSTER_PORTRAITS);
}
