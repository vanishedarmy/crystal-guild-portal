function safeLevel(monster) {
  const level = Number(monster?.level);
  return Number.isFinite(level) ? level : Number.POSITIVE_INFINITY;
}

function safeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function compareBestiaryByLevel(left, right) {
  const levelDifference = safeLevel(left) - safeLevel(right);
  if (levelDifference !== 0) return levelDifference;

  const leftName = safeText(left?.name);
  const rightName = safeText(right?.name);
  if (leftName < rightName) return -1;
  if (leftName > rightName) return 1;

  const leftId = safeText(left?.id);
  const rightId = safeText(right?.id);
  if (leftId < rightId) return -1;
  if (leftId > rightId) return 1;
  return 0;
}

export function sortBestiaryByLevel(monsters) {
  return Array.isArray(monsters)
    ? [...monsters].sort(compareBestiaryByLevel)
    : [];
}
