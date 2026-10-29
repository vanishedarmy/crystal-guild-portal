/** Authoritative absolute seconds are preferred; fallback handles old snapshots. */
export function statusDeadlineMs(status, receivedAtMs = Date.now()) {
  const until = Number(status?.until || 0);
  if (Number.isFinite(until) && until > 0) return until * 1000;
  const remaining = Number(status?.remaining_seconds || 0);
  if (Number.isFinite(remaining) && remaining > 0) return receivedAtMs + remaining * 1000;
  return 0;
}

export function currentActivityLabel(status, secondsLeft) {
  if (!status) return 'Ready';
  if (secondsLeft > 0) {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const time = minutes >= 60
      ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
      : `${minutes}m ${String(seconds).padStart(2, '0')}s`;
    return `${status.label} · ${time}`;
  }
  if (status.state === 'resting') return 'Rest Complete';
  if (['on_hunt', 'on_expedition', 'in_venture', 'in_dungeon'].includes(status.state) && status.until > 0)
    return `${status.label} · Ready to resolve`;
  if (['in_battle', 'in_raid'].includes(status.state) && status.until > 0)
    return `${status.label} · Next round due`;
  return status.label || 'Ready';
}
