import { number } from "../utils/formatters.js";

export function relicStatus(relic = {}) {
  if (relic.completed) return "complete";
  if (relic.ready) return "ready";
  return Number(relic.stage || 0) > 0 ? "in_progress" : "not_started";
}

export function nextRelicObjective(relic = {}) {
  if (relic.completed) return "All three stages have been completed.";
  const next = relic.path?.[Number(relic.stage || 0)];
  if (!next) return relic.current_reward || "Open for progression details";
  if (next.ready) return `All requirements and materials are ready for ${next.name}.`;
  const missing = (next.requirements || []).find((req) => !req.met);
  if (missing) return `${missing.label}: ${number(missing.current)} / ${number(missing.required)}`;
  const material = (next.cost?.materials || []).find((item) => !item.met);
  if (material) return `${material.name}: ${number(material.owned)} / ${number(material.required)} owned`;
  if (next.cost?.gil && !next.cost.gil.met) return `Gil: ${number(next.cost.gil.owned)} / ${number(next.cost.gil.required)}`;
  if (next.cost?.hunt_seals && !next.cost.hunt_seals.met) return `Hunt Seals: ${number(next.cost.hunt_seals.owned)} / ${number(next.cost.hunt_seals.required)}`;
  return `Next: ${next.name}`;
}

export function filterAndSortRelics(relics = [], { query = "", filter = "all", sort = "job" } = {}) {
  const needle = String(query).trim().toLocaleLowerCase();
  return relics.filter((relic) => {
    if (filter !== "all" && relicStatus(relic) !== filter) return false;
    if (!needle) return true;
    return [relic.name, relic.job, relic.next_stage, relic.final_reward?.name, ...(relic.stages || [])]
      .some((value) => String(value || "").toLocaleLowerCase().includes(needle));
  }).sort((a, b) => {
    if (sort === "progress") return Number(b.stage || 0) - Number(a.stage || 0) || String(a.job).localeCompare(String(b.job));
    if (sort === "ready") {
      const rank = { ready: 0, in_progress: 1, not_started: 2, complete: 3 };
      return rank[relicStatus(a)] - rank[relicStatus(b)] || String(a.job).localeCompare(String(b.job));
    }
    return String(a.job).localeCompare(String(b.job)) || String(a.name).localeCompare(String(b.name));
  });
}
