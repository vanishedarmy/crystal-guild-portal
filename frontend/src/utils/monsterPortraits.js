const MONSTER_PORTRAITS = {
  goblin: "/retro-phase-ii/monster-portraits-v6/goblin.webp",
  wolf: "/retro-phase-ii/monster-portraits-v6/wolf.webp",
  mandragora: "/retro-phase-ii/monster-portraits-v6/mandragora.webp",
  goblin_chieftain: "/retro-phase-ii/monster-portraits-v6/goblin_chieftain.webp",
  goblin_guard: "/retro-phase-ii/monster-portraits-v6/goblin_guard.webp",
  hornet: "/retro-phase-ii/monster-portraits-v6/hornet.webp",
  flan: "/retro-phase-ii/monster-portraits-v6/flan.webp",
  imp: "/retro-phase-ii/monster-portraits-v6/imp.webp",
  dire_wolf_alpha: "/retro-phase-ii/monster-portraits-v6/dire_wolf_alpha.webp",
  bomb: "/retro-phase-ii/monster-portraits-v6/bomb.webp",
  cockatrice: "/retro-phase-ii/monster-portraits-v6/cockatrice.webp",
  bat: "/retro-phase-ii/monster-portraits-v6/bat.webp",
  queen_hornet: "/retro-phase-ii/monster-portraits-v6/queen_hornet.webp",
  ochu: "/retro-phase-ii/monster-portraits-v6/ochu.webp",
  skeleton: "/retro-phase-ii/monster-portraits-v6/skeleton.webp",
  cactuar: "/retro-phase-ii/monster-portraits-v6/cactuar.webp",
  ossuary_knight: "/retro-phase-ii/monster-portraits-v6/ossuary_knight.webp",
  spriggan: "/retro-phase-ii/monster-portraits-v6/spriggan.webp",
  basilisk: "/retro-phase-ii/monster-portraits-v6/basilisk.webp",
  crimson_detonator: "/retro-phase-ii/monster-portraits-v6/crimson_detonator.webp",
  gigas: "/retro-phase-ii/monster-portraits-v6/gigas.webp",
  lamia: "/retro-phase-ii/monster-portraits-v6/lamia.webp",
  mimic: "/retro-phase-ii/monster-portraits-v6/mimic.webp",
  gargoyle: "/retro-phase-ii/monster-portraits-v6/gargoyle.webp",
  sahagin: "/retro-phase-ii/monster-portraits-v6/sahagin.webp",
  sahagin_prince: "/retro-phase-ii/monster-portraits-v6/sahagin_prince.webp",
  tonberry: "/retro-phase-ii/monster-portraits-v6/tonberry.webp",
  killer_fish: "/retro-phase-ii/monster-portraits-v6/killer_fish.webp",
  cactuar_jack: "/retro-phase-ii/monster-portraits-v6/cactuar_jack.webp",
  gigantoad: "/retro-phase-ii/monster-portraits-v6/gigantoad.webp",
  mindflayer: "/retro-phase-ii/monster-portraits-v6/mindflayer.webp",
  zu: "/retro-phase-ii/monster-portraits-v6/zu.webp",
  antlion: "/retro-phase-ii/monster-portraits-v6/antlion.webp",
  piscodemon: "/retro-phase-ii/monster-portraits-v6/piscodemon.webp",
  black_flan: "/retro-phase-ii/monster-portraits-v6/black_flan.webp",
  coeurl: "/retro-phase-ii/monster-portraits-v6/coeurl.webp",
  sand_worm: "/retro-phase-ii/monster-portraits-v6/sand_worm.webp",
  chimera: "/retro-phase-ii/monster-portraits-v6/chimera.webp",
  remora: "/retro-phase-ii/monster-portraits-v6/remora.webp",
  king_coeurl: "/retro-phase-ii/monster-portraits-v6/king_coeurl.webp",
  magic_pot: "/retro-phase-ii/monster-portraits-v6/magic_pot.webp",
  malboro: "/retro-phase-ii/monster-portraits-v6/malboro.webp",
  sea_serpent: "/retro-phase-ii/monster-portraits-v6/sea_serpent.webp",
  riven_ronin: "/retro-phase-ii/monster-portraits-v6/riven_ronin.webp",
  adamantoise: "/retro-phase-ii/monster-portraits-v6/adamantoise.webp",
  magitek_drone: "/retro-phase-ii/monster-portraits-v6/magitek_drone.webp",
  ahriman: "/retro-phase-ii/monster-portraits-v6/ahriman.webp",
  garuda: "/retro-phase-ii/monster-portraits-v6/garuda.webp",
  malboro_overlord: "/retro-phase-ii/monster-portraits-v6/malboro_overlord.webp",
  death_claw: "/retro-phase-ii/monster-portraits-v6/death_claw.webp",
  iron_giant: "/retro-phase-ii/monster-portraits-v6/iron_giant.webp",
  iron_giant_exile: "/retro-phase-ii/monster-portraits-v6/iron_giant_exile.webp",
  ironclad: "/retro-phase-ii/monster-portraits-v6/ironclad.webp",
  behemoth: "/retro-phase-ii/monster-portraits-v6/behemoth.webp",
  chimera_brain: "/retro-phase-ii/monster-portraits-v6/chimera_brain.webp",
  evil_eye: "/retro-phase-ii/monster-portraits-v6/evil_eye.webp",
  malboro_great: "/retro-phase-ii/monster-portraits-v6/malboro_great.webp",
  three_moon_chimera: "/retro-phase-ii/monster-portraits-v6/three_moon_chimera.webp",
  death_machine: "/retro-phase-ii/monster-portraits-v6/death_machine.webp",
  magitek_armor: "/retro-phase-ii/monster-portraits-v6/magitek_armor.webp",
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
