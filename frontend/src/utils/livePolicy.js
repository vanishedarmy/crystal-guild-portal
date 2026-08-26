export function reconnectDelay(attempt) {
  const step = Math.max(0, Math.min(Number(attempt) || 0, 5));
  return Math.min(1000 * (2 ** step), 15000);
}

export function streamIsFresh(readyState, openState, lastEventAt, now, staleMs) {
  return readyState === openState
    && Boolean(lastEventAt)
    && now - lastEventAt <= staleMs;
}
