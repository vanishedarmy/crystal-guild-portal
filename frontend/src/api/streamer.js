import { getJson } from "./client.js";

export function fetchStreamerDashboard(signal) {
  return getJson("/api/streamer", { signal });
}
