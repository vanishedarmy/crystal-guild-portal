export function handleTabListKeyDown(event, onSelect) {
  if (!event || typeof onSelect !== "function" || event.altKey || event.ctrlKey || event.metaKey) return;
  const key = event.key;
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(key)) return;

  const tablist = event.currentTarget;
  const tabs = Array.from(tablist?.querySelectorAll?.('[role="tab"]') || []).filter((tab) => !tab.disabled);
  if (!tabs.length) return;

  const current = event.target?.closest?.('[role="tab"]');
  let index = Math.max(0, tabs.indexOf(current));
  if (key === "Home") index = 0;
  else if (key === "End") index = tabs.length - 1;
  else if (key === "ArrowRight" || key === "ArrowDown") index = (index + 1) % tabs.length;
  else index = (index - 1 + tabs.length) % tabs.length;

  const next = tabs[index];
  const value = next?.dataset?.tabValue;
  if (!next || !value) return;

  event.preventDefault();
  onSelect(value);
  next.focus({ preventScroll: true });
}
