/** Shared, optional presentation preferences for information-heavy adventurer pages.
 * Unlike gameplay settings, these are browser-local and do not trigger server calls.
 */
export const DISPLAY_PREFERENCES_KEY = "crystal-guild-display:v1";
export const ACCESSIBLE_PROFILE_TABS = new Set([
  "overview", "hunts", "jobs", "inventory", "shop", "blacksmith", "chocobo",
  "retainer", "mercs", "fellowship", "guild_board", "bestiary", "relics",
  "achievements", "records", "trophies", "seasonal",
]);

const DEFAULTS = Object.freeze({ comfortable: true, highContrast: false });
let current = null;
const subscribers = new Set();
let storageListening = false;

function readStored() {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DISPLAY_PREFERENCES_KEY) || "null");
    return {
      comfortable: typeof parsed?.comfortable === "boolean" ? parsed.comfortable : DEFAULTS.comfortable,
      highContrast: typeof parsed?.highContrast === "boolean" ? parsed.highContrast : DEFAULTS.highContrast,
    };
  } catch { return DEFAULTS; }
}

export function getDisplayPreferences() {
  if (!current) current = readStored();
  return current; // Stable snapshot for React.useSyncExternalStore.
}

function publish(next) {
  const old = getDisplayPreferences();
  if (old.comfortable === next.comfortable && old.highContrast === next.highContrast) return;
  current = next;
  subscribers.forEach((notify) => notify());
}

function onStorage(event) {
  if (event.key === DISPLAY_PREFERENCES_KEY || event.key === null) publish(readStored());
}

export function subscribeDisplayPreferences(notify) {
  subscribers.add(notify);
  if (!storageListening && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
    storageListening = true;
  }
  return () => {
    subscribers.delete(notify);
    if (storageListening && subscribers.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
      storageListening = false;
    }
  };
}

export function setDisplayPreference(name, enabled) {
  if (name !== "comfortable" && name !== "highContrast") return;
  const next = { ...getDisplayPreferences(), [name]: Boolean(enabled) };
  // UI stays usable even with disabled browser storage/private browsing.
  try { if (typeof window !== "undefined") window.localStorage.setItem(DISPLAY_PREFERENCES_KEY, JSON.stringify(next)); }
  catch { /* Browser-only preference; no gameplay impact. */ }
  publish(next);
}
