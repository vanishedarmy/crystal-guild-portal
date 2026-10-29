function normalized(value) {
  return String(value || "").trim().toLowerCase();
}

function safeLevel(player) {
  const level = Number(player?.level);
  return Number.isFinite(level) ? level : Number.NEGATIVE_INFINITY;
}

export function sortGuildDirectory(players = [], ownUsername = "") {
  const own = normalized(ownUsername);
  return [...players].sort((left, right) => {
    const leftOwn = own && normalized(left?.username) === own;
    const rightOwn = own && normalized(right?.username) === own;
    if (leftOwn !== rightOwn) return leftOwn ? -1 : 1;

    const levelDifference = safeLevel(right) - safeLevel(left);
    if (levelDifference !== 0) return levelDifference;

    return String(left?.display_name || left?.username || "").localeCompare(
      String(right?.display_name || right?.username || ""),
      undefined,
      { sensitivity: "base" },
    );
  });
}
