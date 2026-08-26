import { getJson } from "./client.js";

export function fetchFellowship(signal) {
  return getJson("/api/fellowship", { signal });
}
