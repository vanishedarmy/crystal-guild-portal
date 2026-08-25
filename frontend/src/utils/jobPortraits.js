const JOB_PORTRAITS = {
  "black mage": "/retro-phase-ii/job-portraits-v2/black_mage.webp",
  "white mage": "/retro-phase-ii/job-portraits-v2/white_mage.webp",
  "red mage": "/retro-phase-ii/job-portraits-v2/red_mage.webp",
  warrior: "/retro-phase-ii/job-portraits-v2/warrior.webp",
  paladin: "/retro-phase-ii/job-portraits-v2/paladin.webp",
  "dark knight": "/retro-phase-ii/job-portraits-v2/dark_knight.webp",
  dragoon: "/retro-phase-ii/job-portraits-v2/dragoon.webp",
  monk: "/retro-phase-ii/job-portraits-v2/monk.webp",
  thief: "/retro-phase-ii/job-portraits-v2/thief.webp",
  rogue: "/retro-phase-ii/job-portraits-v2/thief.webp",
  ranger: "/retro-phase-ii/job-portraits-v2/ranger.webp",
  summoner: "/retro-phase-ii/job-portraits-v2/summoner.webp",
  ninja: "/retro-phase-ii/job-portraits-v2/ninja.webp",
  samurai: "/retro-phase-ii/job-portraits-v2/samurai.webp",
  "blue mage": "/retro-phase-ii/job-portraits-v2/blue_mage.webp",
  "time mage": "/retro-phase-ii/job-portraits-v2/time_mage.webp",
  bard: "/retro-phase-ii/job-portraits-v2/bard.webp",
  machinist: "/retro-phase-ii/job-portraits-v2/machinist.webp",
  beastmaster: "/retro-phase-ii/job-portraits-v2/beastmaster.webp",
  "beastmaster i": "/retro-phase-ii/job-portraits-v2/beastmaster.webp",
  sage: "/retro-phase-ii/job-portraits-v2/sage.webp",
};

export function normalizeJobName(jobName) {
  return String(jobName || "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

export function jobPortraitPath(jobName) {
  return JOB_PORTRAITS[normalizeJobName(jobName)] || "";
}

export function hasJobPortrait(jobName) {
  return Boolean(jobPortraitPath(jobName));
}

export function jobPortraitEntries() {
  return Object.entries(JOB_PORTRAITS);
}
