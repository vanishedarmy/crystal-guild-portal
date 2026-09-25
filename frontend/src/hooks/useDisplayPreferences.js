import { useSyncExternalStore } from "react";
import { getDisplayPreferences, subscribeDisplayPreferences } from "../utils/displayPreferences.js";

// One stable snapshot for every workbench and eligible profile section.
export default function useDisplayPreferences() {
  return useSyncExternalStore(subscribeDisplayPreferences, getDisplayPreferences, getDisplayPreferences);
}
