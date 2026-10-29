function norm(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function filterGuideAchievements(achievements, filters = {}) {
  const query = norm(filters.query);
  const category = norm(filters.category);
  const tier = norm(filters.tier);
  return achievements.filter((achievement) => {
    const isSecret = Boolean(achievement.secret);
    const visibleName = isSecret ? "Secret Achievement" : achievement.name;
    const visibleDescription = isSecret
      ? "Hidden until unlocked in-game."
      : achievement.description;
    const visibleCategory = isSecret ? "Secret" : achievement.category;
    const haystack = norm([
      visibleName,
      visibleDescription,
      visibleCategory,
      achievement.tier,
      achievement.points,
    ].join(" "));
    return (!query || haystack.includes(query))
      && (!category || norm(visibleCategory) === category)
      && (!tier || norm(achievement.tier || "bronze") === tier);
  });
}

export function filterGuideTitles(titles, filters = {}) {
  const query = norm(filters.query);
  const category = norm(filters.category);
  const rarity = norm(filters.rarity);
  return titles.filter((title) => {
    const haystack = norm([
      title.name,
      title.description,
      title.category,
      title.rarity,
      title.source,
    ].join(" "));
    return (!query || haystack.includes(query))
      && (!category || norm(title.category || "General") === category)
      && (!rarity || norm(title.rarity || "common") === rarity);
  });
}
