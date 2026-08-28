export function campDeadlineMs(status, receivedAtMs = Date.now()) {
  if (status?.state !== "resting") return 0;

  const absoluteUntil = Number(status?.until || status?.camp_until || 0);
  if (Number.isFinite(absoluteUntil) && absoluteUntil > 0) {
    return absoluteUntil * 1000;
  }

  const remaining = Math.max(0, Number(status?.remaining_seconds || 0));
  return remaining > 0 ? Number(receivedAtMs) + (remaining * 1000) : 0;
}

export function campRemainingSeconds(deadlineMs, nowMs = Date.now()) {
  const deadline = Number(deadlineMs || 0);
  if (!Number.isFinite(deadline) || deadline <= 0) return 0;
  return Math.max(0, Math.ceil((deadline - Number(nowMs)) / 1000));
}
