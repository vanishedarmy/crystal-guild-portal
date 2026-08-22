export function achievementCategories(achievements = []) {
  return ["All", ...new Set(achievements.map((item) => item.category).filter(Boolean))];
}

export function filterAchievements(achievements = [], category = "All", state = "all") {
  return achievements.filter((item) => {
    const categoryMatch = category === "All" || item.category === category;
    const stateMatch = state === "all" || (state === "unlocked" ? item.unlocked : !item.unlocked);
    return categoryMatch && stateMatch;
  });
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
