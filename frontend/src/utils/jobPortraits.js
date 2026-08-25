const JOB_PORTRAITS = {
  "black mage": "/retro-phase-ii/job-portraits-v1/black_mage.webp",
  "white mage": "/retro-phase-ii/job-portraits-v1/white_mage.webp",
  "red mage": "/retro-phase-ii/job-portraits-v1/red_mage.webp",
  paladin: "/retro-phase-ii/job-portraits-v1/paladin.webp",
  "dark knight": "/retro-phase-ii/job-portraits-v1/dark_knight.webp",
  dragoon: "/retro-phase-ii/job-portraits-v1/dragoon.webp",
  monk: "/retro-phase-ii/job-portraits-v1/monk.webp",
  thief: "/retro-phase-ii/job-portraits-v1/thief.webp",
  rogue: "/retro-phase-ii/job-portraits-v1/thief.webp",
  ranger: "/retro-phase-ii/job-portraits-v1/ranger.webp",
  summoner: "/retro-phase-ii/job-portraits-v1/summoner.webp",
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
