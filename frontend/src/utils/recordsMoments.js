import { duration, number } from "./formatters.js";
import { humanizeLabel } from "./displayLabels.js";

const RECORD_CATEGORIES = [
  ["combat", "Battle Honors", "The victories you earned by the skin of your teeth."],
  ["economy", "Gil & Good Judgment", "The Guild has kept every receipt. Unfortunately."],
  ["world_events", "World Events", "Stories big enough to make the tavern rounds."],
  ["ventures", "Ventures", "Every detour, narrow escape and remarkable haul."],
  ["raids", "Raids & Trials", "The spoils of working together, and surviving it."],
  ["gold_saucer", "Gold Saucer", "Win big, lose bigger, blame the house."],
];

export const personalRecordCategories = Object.freeze(RECORD_CATEGORIES.map(([id, title, description]) => ({ id, title, description })));

export function formatPersonalBest(record) {
  if (!record || record.status !== "recorded" || record.value === null || record.value === undefined) return "—";
  const value = record.value;
  switch (record.unit) {
    case "seconds": return duration(value);
    case "gil": return `${number(value)} Gil`;
    case "mgp": return `${number(value)} MGP`;
    case "hp": return `${number(value)} HP`;
    case "damage": return `${number(value)} damage`;
    case "rounds": return `${number(value)} round${Number(value) === 1 ? "" : "s"}`;
    case "plays": return `${number(value)} in a row`;
    case "threat": return String(value);
    default: return number(value);
  }
}

export function personalBestContext(record) {
  const context = record?.context;
  if (!context || typeof context !== "object") return "";
  if (typeof context.monster === "string") return `Against ${humanizeLabel(context.monster)}`;
  if (typeof context.boss === "string") return `Against ${humanizeLabel(context.boss)}`;
  if (Array.isArray(context.events) && context.events.length) return context.events.map((name) => humanizeLabel(name)).join(" · ");
  if (typeof context.game === "string") return `At ${context.game === "mini_cactpot" ? "Mini Cactpot" : humanizeLabel(context.game)}`;
  if (typeof context.last_game === "string") return `Last game: ${context.last_game === "mini_cactpot" ? "Mini Cactpot" : humanizeLabel(context.last_game)}`;
  if (typeof context.source === "string") {
    const places = {
      shop: "At the Moogle Emporium", portal_shop: "At the Moogle Emporium",
      trading_post_buy: "At the Trading Post", trading_post_sale: "At the Trading Post",
      sell: "At a shop", portal_sell: "At the Moogle Emporium",
      forge: "At the Blacksmith",
    };
    return places[context.source] || `At ${humanizeLabel(context.source)}`;
  }
  return "";
}

export function personalBestEmptyMessage(record) {
  return record?.status === "awaiting_tracking"
    ? "Waiting for your next qualifying adventure. Older results didn't track this detail."
    : "Nothing in the ledger yet. There's a first time for everything.";
}

// SQLite CURRENT_TIMESTAMP is UTC; historical reconciliation can also carry
// numeric Unix timestamps. Bad or missing dates should never break a card.
export function readableRecordDate(value) {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value).trim();
  const date = /^\d{9,13}$/.test(raw)
    ? new Date(Number(raw) * (raw.length <= 10 ? 1000 : 1))
    : new Date(/(?:Z|[+-]\d\d:\d\d)$/i.test(raw) ? raw : `${raw.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function filterMomentEntries(entries, state, category) {
  const safe = Array.isArray(entries) ? entries : [];
  return safe.filter((moment) => {
    if (state === "earned" && !moment.unlocked) return false;
    if (state === "undiscovered" && moment.unlocked) return false;
    return category === "All" || moment.category === category;
  });
}

// Secret Moment IDs and badge IDs exist only in the player's owned server row.
// Unowned secrets are sealed slots and have no asset URL to reconstruct.
export function momentBadgeSrc(moment) {
  if (!moment || (moment.secret && !moment.unlocked)) return null;
  const id = moment.badge_id;
  if (typeof id !== "string" || !/^moment_badge_[a-z0-9_]+$/.test(id)) return null;
  return `/moments/a1/${id.slice("moment_badge_".length).replaceAll("_", "-")}.webp`;
}


/** Only server-confirmed, recently earned Moments merit a new-discovery notice.
 * Historical reconciliation and sealed slots are deliberately excluded. */
export function selectNewMomentNotices(entries, previouslySeen = [], now = Date.now(), maxAgeHours = 48) {
  const known = new Set(previouslySeen);
  const limit = Number(maxAgeHours) * 3_600_000;
  return (Array.isArray(entries) ? entries : [])
    .filter((entry) => entry?.unlocked === true && !entry.historical &&
      typeof entry.id === "string" && !known.has(entry.id) &&
      typeof entry.name === "string" && typeof entry.reward_title === "string")
    .map((entry) => ({ ...entry, when: Date.parse(
      /(?:Z|[+-]\d\d:\d\d)$/i.test(String(entry.unlocked_at || ""))
        ? String(entry.unlocked_at) : `${String(entry.unlocked_at || "").replace(" ", "T")}Z`
    ) }))
    .filter((entry) => Number.isFinite(entry.when) && entry.when <= now + 300_000 && now - entry.when <= limit)
    .sort((a, b) => b.when - a.when)
    .map(({ when, ...entry }) => entry);
}
