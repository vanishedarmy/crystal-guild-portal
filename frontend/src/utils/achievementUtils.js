export function achievementCategories(achievements = []) {
  return ["All", ...new Set(achievements.map((item) => item.category).filter(Boolean))];
}

const TIER_ASCENDING = { bronze: 0, silver: 1, gold: 2, crystal: 3 };

function numericProgress(progress = {}) {
  const value = Number(progress.raw_value ?? progress.value ?? 0);
  const target = Number(progress.target ?? 0);
  const percent = Number(progress.percent ?? (target > 0 ? (value / target) * 100 : 0));
  return {
    value: Number.isFinite(value) ? Math.max(0, value) : 0,
    target: Number.isFinite(target) ? Math.max(0, target) : 0,
    percent: Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0,
  };
}

export function achievementAttainmentState(achievement = {}) {
  if (achievement.unlocked) return "earned";
  if (achievement.progress?.hidden) return "hidden";
  const { value, percent } = numericProgress(achievement.progress);
  return value > 0 || percent > 0 ? "progress" : "not_started";
}

export function sortAchievements(achievements = []) {
  const stateRank = { earned: 0, progress: 1, not_started: 2, hidden: 3 };

  return [...achievements].sort((a, b) => {
    const aState = achievementAttainmentState(a);
    const bState = achievementAttainmentState(b);
    const stateDiff = stateRank[aState] - stateRank[bState];
    if (stateDiff) return stateDiff;

    const aProgress = numericProgress(a.progress);
    const bProgress = numericProgress(b.progress);
    const aTier = TIER_ASCENDING[String(a.tier || "bronze").toLowerCase()] ?? 9;
    const bTier = TIER_ASCENDING[String(b.tier || "bronze").toLowerCase()] ?? 9;

    // Earned and not-yet-started milestones read most naturally from the
    // smallest requirement upward: 10 -> 25 -> 50, bronze -> silver -> gold.
    if (aState === "earned" || aState === "not_started") {
      const targetDiff = aProgress.target - bProgress.target;
      if (targetDiff) return targetDiff;
      const tierDiff = aTier - bTier;
      if (tierDiff) return tierDiff;
    }

    // Active goals are primarily ordered by how close the player is to
    // finishing them. A lower requirement wins ties so attainable milestones
    // remain ahead of much longer grinds at the same percentage.
    if (aState === "progress") {
      const percentDiff = bProgress.percent - aProgress.percent;
      if (percentDiff) return percentDiff;
      const remainingA = Math.max(0, aProgress.target - aProgress.value);
      const remainingB = Math.max(0, bProgress.target - bProgress.value);
      const remainingDiff = remainingA - remainingB;
      if (remainingDiff) return remainingDiff;
      const targetDiff = aProgress.target - bProgress.target;
      if (targetDiff) return targetDiff;
      const tierDiff = aTier - bTier;
      if (tierDiff) return tierDiff;
    }

    // Hidden achievements intentionally expose no target/progress. Keep them
    // at the end of the unearned list and use tier/category/name only for a
    // deterministic order instead of treating their concealed target as 0.
    if (aState === "hidden") {
      const tierDiff = aTier - bTier;
      if (tierDiff) return tierDiff;
    }

    const categoryDiff = String(a.category || "").localeCompare(String(b.category || ""));
    if (categoryDiff) return categoryDiff;
    return String(a.name || a.id || "").localeCompare(String(b.name || b.id || ""));
  });
}

export function filterAchievements(achievements = [], category = "All", state = "all") {
  const filtered = achievements.filter((item) => {
    const categoryMatch = category === "All" || item.category === category;
    const stateMatch = state === "all" || (state === "unlocked" ? item.unlocked : !item.unlocked);
    return categoryMatch && stateMatch;
  });
  return sortAchievements(filtered);
}

export function filterTitles(titles = [], state = "unlocked", rarity = "All") {
  return titles.filter((item) => {
    const stateMatch = state === "all" || (state === "unlocked" ? item.unlocked : !item.unlocked);
    const rarityMatch = rarity === "All" || item.rarity === rarity.toLowerCase();
    return stateMatch && rarityMatch;
  });
}

export function progressText(progress = {}) {
  const value = Number(progress.value || 0).toLocaleString();
  const target = Number(progress.target || 0).toLocaleString();
  return `${value} / ${target}`;
}
