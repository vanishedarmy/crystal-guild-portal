const MONSTER_PORTRAITS = {
  goblin: "/retro-phase-ii/monster-portraits-v5/goblin.webp",
  wolf: "/retro-phase-ii/monster-portraits-v5/wolf.webp",
  mandragora: "/retro-phase-ii/monster-portraits-v5/mandragora.webp",
  goblin_chieftain: "/retro-phase-ii/monster-portraits-v5/goblin_chieftain.webp",
  goblin_guard: "/retro-phase-ii/monster-portraits-v5/goblin_guard.webp",
  hornet: "/retro-phase-ii/monster-portraits-v5/hornet.webp",
  flan: "/retro-phase-ii/monster-portraits-v5/flan.webp",
  imp: "/retro-phase-ii/monster-portraits-v5/imp.webp",
  dire_wolf_alpha: "/retro-phase-ii/monster-portraits-v5/dire_wolf_alpha.webp",
  bomb: "/retro-phase-ii/monster-portraits-v5/bomb.webp",
  cockatrice: "/retro-phase-ii/monster-portraits-v5/cockatrice.webp",
  bat: "/retro-phase-ii/monster-portraits-v5/bat.webp",
  queen_hornet: "/retro-phase-ii/monster-portraits-v5/queen_hornet.webp",
  ochu: "/retro-phase-ii/monster-portraits-v5/ochu.webp",
  skeleton: "/retro-phase-ii/monster-portraits-v5/skeleton.webp",
  cactuar: "/retro-phase-ii/monster-portraits-v5/cactuar.webp",
  ossuary_knight: "/retro-phase-ii/monster-portraits-v5/ossuary_knight.webp",
  spriggan: "/retro-phase-ii/monster-portraits-v5/spriggan.webp",
  basilisk: "/retro-phase-ii/monster-portraits-v5/basilisk.webp",
  crimson_detonator: "/retro-phase-ii/monster-portraits-v5/crimson_detonator.webp",
  gigas: "/retro-phase-ii/monster-portraits-v5/gigas.webp",
  lamia: "/retro-phase-ii/monster-portraits-v5/lamia.webp",
  mimic: "/retro-phase-ii/monster-portraits-v5/mimic.webp",
  gargoyle: "/retro-phase-ii/monster-portraits-v5/gargoyle.webp",
  sahagin: "/retro-phase-ii/monster-portraits-v5/sahagin.webp",
  sahagin_prince: "/retro-phase-ii/monster-portraits-v5/sahagin_prince.webp",
  tonberry: "/retro-phase-ii/monster-portraits-v5/tonberry.webp",
  killer_fish: "/retro-phase-ii/monster-portraits-v5/killer_fish.webp",
  cactuar_jack: "/retro-phase-ii/monster-portraits-v5/cactuar_jack.webp",
  gigantoad: "/retro-phase-ii/monster-portraits-v5/gigantoad.webp",
  mindflayer: "/retro-phase-ii/monster-portraits-v5/mindflayer.webp",
  zu: "/retro-phase-ii/monster-portraits-v5/zu.webp",
  antlion: "/retro-phase-ii/monster-portraits-v5/antlion.webp",
  piscodemon: "/retro-phase-ii/monster-portraits-v5/piscodemon.webp",
  black_flan: "/retro-phase-ii/monster-portraits-v5/black_flan.webp",
  coeurl: "/retro-phase-ii/monster-portraits-v5/coeurl.webp",
  sand_worm: "/retro-phase-ii/monster-portraits-v5/sand_worm.webp",
  chimera: "/retro-phase-ii/monster-portraits-v5/chimera.webp",
  remora: "/retro-phase-ii/monster-portraits-v5/remora.webp",
  king_coeurl: "/retro-phase-ii/monster-portraits-v5/king_coeurl.webp",
  magic_pot: "/retro-phase-ii/monster-portraits-v5/magic_pot.webp",
  malboro: "/retro-phase-ii/monster-portraits-v5/malboro.webp",
  sea_serpent: "/retro-phase-ii/monster-portraits-v5/sea_serpent.webp",
  riven_ronin: "/retro-phase-ii/monster-portraits-v5/riven_ronin.webp",
  adamantoise: "/retro-phase-ii/monster-portraits-v5/adamantoise.webp",
  magitek_drone: "/retro-phase-ii/monster-portraits-v5/magitek_drone.webp",
  ahriman: "/retro-phase-ii/monster-portraits-v5/ahriman.webp",
  garuda: "/retro-phase-ii/monster-portraits-v5/garuda.webp",
  malboro_overlord: "/retro-phase-ii/monster-portraits-v5/malboro_overlord.webp",
  death_claw: "/retro-phase-ii/monster-portraits-v5/death_claw.webp",
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
