import { getJson } from "./client.js";
import { enrichInventoryWithCatalog } from "../utils/itemCatalog.js";

export function fetchPlayers(search = "", signal) {
  const query = new URLSearchParams();
  if (search.trim()) query.set("search", search.trim());
  const suffix = query.size ? `?${query.toString()}` : "";
  return getJson(`/api/players${suffix}`, { signal });
}

export async function fetchPlayer(username, module = "overview", signal) {
  const key = encodeURIComponent(username);
  const suffix = module === "overview" ? "" : `/${module}`;
  const payload = await getJson(`/api/player/${key}${suffix}`, { signal });
  return module === "inventory" ? enrichInventoryWithCatalog(payload) : payload;
}
