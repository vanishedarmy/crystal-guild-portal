/**
 * Keep the first refresh immediate, then do a single bounded fallback only if
 * the live revision stream has not delivered an update. This replaces two
 * unconditional full-profile reloads for every successful Portal mutation.
 * The Bot now wakes snapshot sync as soon as a mutation is acknowledged.
 */
export function refreshAfterPortalMutation(onRefresh, delayMs = 1800) {
  if (typeof onRefresh !== "function") return;
  onRefresh();
  if (typeof window === "undefined") return;
  let timer;
  const onRevision = () => {
    window.clearTimeout(timer);
    window.removeEventListener("crystal-guild-live-revision", onRevision);
  };
  window.addEventListener("crystal-guild-live-revision", onRevision, { once: true });
  timer = window.setTimeout(() => {
    window.removeEventListener("crystal-guild-live-revision", onRevision);
    onRefresh();
  }, delayMs);
}
