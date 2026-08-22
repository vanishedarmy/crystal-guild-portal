import { useEffect, useMemo, useRef, useState } from "react";
import {
  submitEquipItem,
  submitRecoveryState,
  submitStartRest,
  submitUnequipSlot,
  submitUseFieldItem,
  waitForPortalAction,
} from "../api/auth.js";
import ProgressBar from "../components/ProgressBar.jsx";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { campRemainingSeconds } from "../utils/campCountdown.js";
import { duration, formatBonuses, formatItemUse, number, pct } from "../utils/formatters.js";

const GROUP_ORDER = ["weapon", "armor", "accessory", "item", "material"];
const GROUP_LABELS = { weapon: "Weapons", armor: "Armor", accessory: "Accessories", item: "Items", material: "Materials" };
const EQUIPMENT_GROUPS = new Set(["weapon", "armor", "accessory"]);
const STAT_LABELS = { attack: "ATK", magic_power: "M.PWR", str: "STR", vit: "VIT", mag: "MAG", spr: "SPR", dex: "DEX", lck: "LCK", hp: "HP" };

function groupForItem(item) {
  const rawType = String(item.type || "").trim().toLowerCase();
  if (["weapon", "weapons"].includes(rawType)) return "weapon";
  if (["armor", "armour", "armors", "armours"].includes(rawType)) return "armor";
  if (["accessory", "accessories"].includes(rawType)) return "accessory";
  if (["material", "materials"].includes(rawType)) return "material";
  return "item";
}
function slotLabel(item) { const base = GROUP_LABELS[groupForItem(item)] || "Items"; return item.equipped ? `${base} · Equipped` : base; }
function itemLevel(item) { const value = Number(item?.min_level ?? item?.level ?? item?.shop_level); return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY; }
function compareItemsByLevel(left, right) { return itemLevel(left) - itemLevel(right) || String(left?.name || "").localeCompare(String(right?.name || "")); }
function actionKey(kind, target = "self") { const suffix = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}:${Math.random().toString(36).slice(2)}`; return `${kind}:${target}:${suffix}`; }
function itemBonuses(item) { return item?.effective_bonuses || item?.bonuses || {}; }
function equipmentDelta(item, current) {
  const next = itemBonuses(item); const prior = itemBonuses(current); const keys = [...new Set([...Object.keys(next), ...Object.keys(prior)])];
  const parts = keys.map((key) => [key, Number(next[key] || 0) - Number(prior[key] || 0)]).filter(([, value]) => value !== 0).map(([key, value]) => `${STAT_LABELS[key] || key.toUpperCase()} ${value > 0 ? "+" : ""}${value}`);
  return parts.length ? parts.join(" · ") : "No direct stat change";
}
function eligibility(item, overview) {
  if (!overview) return { eligible: true, reason: "" };
  const requiredLevel = Number(item.min_level || 1);
  if (Number(overview.identity?.level || 1) < requiredLevel) return { eligible: false, reason: `Requires Lv.${requiredLevel}` };
  const allowed = Array.isArray(item.allowed_job_ids) ? item.allowed_job_ids : [];
  if (allowed.length && !allowed.includes(overview.job?.id)) return { eligible: false, reason: `Not usable by ${overview.job?.name || "current Job"}` };
  return { eligible: true, reason: "" };
}
function stateActionResult(action, fallback) { return action?.result?.message || fallback; }

export default function Inventory({ data, overview, onDetail, onRefresh }) {
  const { auth } = usePortalAuth();
  const [search, setSearch] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [recoveryState, setRecoveryState] = useState(null);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [usableOnly, setUsableOnly] = useState(false);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const recoveryLoadedFor = useRef("");
  const expiryRefreshFor = useRef(0);

  const isOwnProfile = Boolean(auth.authenticated && auth.player?.username && String(auth.player.username).toLowerCase() === String(data.player?.username || "").toLowerCase());
  const capabilities = new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []);
  const equipmentActionsAvailable = Boolean(isOwnProfile && auth.actions_enabled && capabilities.has("EQUIP_ITEM") && capabilities.has("UNEQUIP_SLOT"));
  const recoveryActionsAvailable = Boolean(isOwnProfile && auth.actions_enabled && capabilities.has("RECOVERY_STATE") && capabilities.has("USE_FIELD_ITEM") && capabilities.has("START_REST"));

  const currentBySlot = useMemo(() => { const map = new Map(); for (const entry of overview?.equipment || []) map.set(entry.slot, entry); return map; }, [overview?.equipment]);
  const recoveryQuantities = useMemo(() => new Map((recoveryState?.items || []).map((item) => [item.id, Number(item.quantity || 0)])), [recoveryState]);
  const displayedItems = useMemo(() => data.items.map((item) => recoveryQuantities.has(item.id) ? { ...item, quantity: recoveryQuantities.get(item.id) } : item).filter((item) => Number(item.quantity || 0) > 0), [data.items, recoveryQuantities]);
  const filtered = useMemo(() => { const term = search.trim().toLowerCase(); return displayedItems.filter((item) => !term || item.name.toLowerCase().includes(term)); }, [displayedItems, search]);
  const grouped = useMemo(() => { const buckets = new Map(GROUP_ORDER.map((group) => [group, []])); for (const item of filtered) buckets.get(groupForItem(item))?.push(item); return GROUP_ORDER.map((group) => ({ key: group, label: GROUP_LABELS[group], items: [...(buckets.get(group) || [])].sort(compareItemsByLevel) })); }, [filtered]);

  const runQueuedAction = async (key, submit, fallback, onComplete) => {
    if (busyKey) return null;
    setBusyKey(key);
    try {
      const response = await submit(); const action = response.action;
      if (!action?.id) throw new Error("Crystal Guild did not return a request ID.");
      const finished = (action.status === "completed" || action.status === "failed") ? action : await waitForPortalAction(action.id);
      if (!finished) throw new Error("This change is still processing. Please check again shortly.");
      const message = stateActionResult(finished, fallback);
      onComplete?.(finished, message);
      return finished;
    } catch (error) {
      onComplete?.(null, error.message);
      return null;
    } finally { setBusyKey(""); }
  };

  const loadRecovery = async ({ quiet = false } = {}) => {
    if (!recoveryActionsAvailable || busyKey) return;
    if (!quiet) setRecoveryMessage("Checking recovery options…");
    await runQueuedAction("recovery-state", () => submitRecoveryState(auth.csrf_token, actionKey("recovery-state")), "Recovery ready.", (finished, message) => {
      const state = finished?.result?.data?.recovery_state;
      if (state) setRecoveryState(state);
      if (!quiet || !state) setRecoveryMessage(message);
    });
  };

  useEffect(() => {
    const identity = `${auth.player?.username || ""}:${data.player?.username || ""}:${auth.action_protocol_version || 0}`;
    if (!recoveryActionsAvailable || recoveryLoadedFor.current === identity) return;
    recoveryLoadedFor.current = identity;
    loadRecovery({ quiet: true });
  }, [recoveryActionsAvailable, auth.player?.username, data.player?.username, auth.action_protocol_version]);

  const campDeadline = Number(recoveryState?.camp_until || 0) * 1000;
  const campRemaining = campRemainingSeconds(campDeadline, clockNow);
  useEffect(() => {
    if (!campDeadline) return undefined;
    const tick = () => setClockNow(Date.now());
    const timer = window.setInterval(tick, 1000);
    const catchUp = () => { tick(); if (document.visibilityState !== "hidden") loadRecovery({ quiet: true }); };
    window.addEventListener("focus", catchUp); window.addEventListener("pageshow", catchUp); document.addEventListener("visibilitychange", catchUp);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", catchUp); window.removeEventListener("pageshow", catchUp); document.removeEventListener("visibilitychange", catchUp); };
  }, [campDeadline, recoveryActionsAvailable]);
  useEffect(() => {
    if (!campDeadline || campRemaining > 0 || expiryRefreshFor.current === campDeadline) return;
    expiryRefreshFor.current = campDeadline; loadRecovery({ quiet: true }); onRefresh?.();
  }, [campDeadline, campRemaining]);

  const equip = (item) => runQueuedAction(`equip:${item.id}`, () => submitEquipItem(item.id, auth.csrf_token, actionKey("equip", item.id)), "Equipment updated.", (finished, message) => { setActionMessage(message); if (finished?.status === "completed") onRefresh?.(); });
  const unequip = (slot) => runQueuedAction(`unequip:${slot}`, () => submitUnequipSlot(slot, auth.csrf_token, actionKey("unequip", slot)), "Equipment updated.", (finished, message) => { setActionMessage(message); if (finished?.status === "completed") onRefresh?.(); });
  const useRecoveryItem = async (item) => {
    if (item.confirm && !window.confirm(`Use ${item.name} now?`)) return;
    await runQueuedAction(`use:${item.id}`, () => submitUseFieldItem(item.id, auth.csrf_token, actionKey("use-item", item.id)), `${item.name} used.`, (finished, message) => {
      setRecoveryMessage(message); const state = finished?.result?.data?.recovery_state; if (state) setRecoveryState(state); if (finished?.status === "completed") onRefresh?.();
    });
  };
  const startRest = () => runQueuedAction("start-rest", () => submitStartRest(auth.csrf_token, actionKey("start-rest")), "Camp updated.", (finished, message) => {
    setRecoveryMessage(message); const state = finished?.result?.data?.recovery_state; if (state) setRecoveryState(state); if (finished?.status === "completed") onRefresh?.();
  });

  const recoveryItems = (recoveryState?.items || []).filter((item) => !usableOnly || item.usable_now);
  const stateLabel = recoveryState?.state_label || (overview?.status?.label || "READY");

  return (
    <section className="panel inventory-phase-five">
      <div className="panel-title-row"><h2>Equipment, Inventory & Recovery</h2><span className="small-badge">{filtered.length} shown · {displayedItems.length} stacks</span></div>

      {isOwnProfile ? (
        <section className="recovery-dashboard" aria-label="Recovery">
          <div className="recovery-heading">
            <div><p className="eyebrow">Recovery</p><h3>{stateLabel}</h3></div>
            <button type="button" className="equipment-action-button secondary" disabled={!recoveryActionsAvailable || Boolean(busyKey)} onClick={() => loadRecovery()}>{busyKey === "recovery-state" ? "Checking…" : "Refresh"}</button>
          </div>
          <div className="recovery-resource-grid">
            <div className="recovery-resource"><span><b>HP</b><em>{number(recoveryState?.hp?.current ?? overview?.hp?.current)} / {number(recoveryState?.hp?.max ?? overview?.hp?.max)}</em></span><ProgressBar value={pct(recoveryState?.hp?.current ?? overview?.hp?.current, recoveryState?.hp?.max ?? overview?.hp?.max)} className="hp" /></div>
            {Number((recoveryState?.mp?.max ?? overview?.resources?.mp?.max) || 0) > 0 ? <div className="recovery-resource"><span><b>MP</b><em>{number(recoveryState?.mp?.current ?? overview?.resources?.mp?.current)} / {number(recoveryState?.mp?.max ?? overview?.resources?.mp?.max)}</em></span><ProgressBar value={pct(recoveryState?.mp?.current ?? overview?.resources?.mp?.current, recoveryState?.mp?.max ?? overview?.resources?.mp?.max)} className="mp" /></div> : null}
            {Number((recoveryState?.ap?.max ?? overview?.resources?.ap?.max) || 0) > 0 ? <div className="recovery-resource"><span><b>AP</b><em>{number(recoveryState?.ap?.current ?? overview?.resources?.ap?.current)} / {number(recoveryState?.ap?.max ?? overview?.resources?.ap?.max)}</em></span><ProgressBar value={pct(recoveryState?.ap?.current ?? overview?.resources?.ap?.current, recoveryState?.ap?.max ?? overview?.resources?.ap?.max)} className="ap" /></div> : null}
          </div>
          {recoveryState?.state === "resting" ? <div className="recovery-callout"><strong>Camp recovery in {duration(campRemaining)}</strong><span>Recovery time stays accurate even if you leave the page and come back.</span></div> : null}
          {recoveryState?.active_statuses?.length ? <div className="recovery-callout"><strong>Active Battle status</strong><span>{recoveryState.active_statuses.map((status) => `${status.name} (${status.turns}r)`).join(" · ")} — use status-curing items during battle.</span></div> : null}
          {recoveryState?.recommended_item_name ? <div className="recovery-suggestion">Suggested recovery: <strong>{recoveryState.recommended_item_name}</strong></div> : null}
          <div className="recovery-actions-row">
            <button type="button" className="equipment-action-button" disabled={!recoveryActionsAvailable || Boolean(busyKey) || recoveryState?.state === "in_battle" || recoveryState?.state === "resting"} onClick={startRest}>{busyKey === "start-rest" ? "Starting…" : recoveryState?.state === "resting" ? "Already Resting" : "Start Camp"}</button>
            <label className="recovery-filter"><input type="checkbox" checked={usableOnly} onChange={(event) => setUsableOnly(event.target.checked)} /> Show usable now</label>
          </div>
          {recoveryMessage ? <div className="recovery-result" aria-live="polite">{recoveryMessage}</div> : null}
          {recoveryItems.length ? <div className="recovery-item-grid">{recoveryItems.map((item) => <article className={`recovery-item ${item.usable_now ? "usable" : ""}`} key={item.id}><div><span className={`item-name rarity-${item.rarity}`}>{item.name}</span><small>Owned {number(item.quantity)}</small><p>{item.preview || item.description || item.reason}</p>{item.preview && item.reason ? <small>{item.reason}</small> : null}</div>{item.field_usable ? <button type="button" className="equipment-action-button" disabled={!recoveryActionsAvailable || !item.usable_now || Boolean(busyKey)} title={!item.usable_now ? item.reason : undefined} onClick={() => useRecoveryItem(item)}>{busyKey === `use:${item.id}` ? "Using…" : item.usable_now ? "Use" : item.reason || "Unavailable"}</button> : <span className="small-badge">Battle only</span>}</article>)}</div> : <div className="muted inventory-group-empty">No recovery items match the current filter.</div>}
        </section>
      ) : null}

      {isOwnProfile ? <div className={`equipment-action-status ${equipmentActionsAvailable ? "ready" : "offline"}`}><strong>{equipmentActionsAvailable ? "Equipment controls ready" : "Equipment controls unavailable"}</strong><span>{equipmentActionsAvailable ? "Equip or unequip gear you own." : "Your inventory is still available to view."}</span>{actionMessage ? <small aria-live="polite">{actionMessage}</small> : null}</div> : null}
      <div className="toolbar"><label className="search-box"><span>Search Inventory</span><input type="search" placeholder="Item name" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
      <div className="inventory-section-list">{grouped.map((group) => <section className="inventory-group" key={group.key}><div className="panel-title-row inventory-group-heading"><h3>{group.label}</h3><span className="small-badge">{group.items.length} {group.items.length === 1 ? "stack" : "stacks"}</span></div>{group.items.length ? <div className="content-grid">{group.items.map((item, index) => { const upgrade = item.upgrade_level ? ` +${item.upgrade_level}` : ""; const rawType = String(item.type || "").toLowerCase(); const isHeldConsumable = group.key === "item" && !["accessory", "weapon", "armor", "material"].includes(rawType); const isEquipment = EQUIPMENT_GROUPS.has(group.key); const current = isEquipment ? currentBySlot.get(group.key) : null; const canUse = eligibility(item, overview); const itemBusy = busyKey === `equip:${item.id}` || busyKey === `unequip:${group.key}`; return <article className="inventory-card inventory-action-card" key={`${group.key}-${item.id || item.name}-${index}`}><button type="button" className="inventory-card-detail" onClick={() => onDetail?.({ type: "inventory", inventoryGroup: group.key, item })}><span className="slot-label">{slotLabel(item)}</span><span className={`item-name rarity-${item.rarity}`}>{item.name}{upgrade}</span><span className="card-meta">Quantity {number(item.quantity)} · {String(item.rarity || "common").replace(/^./, (c) => c.toUpperCase())}</span><span className="item-meta">{isHeldConsumable ? (item.use?.effects?.length ? formatItemUse(item.use) : item.description || "Consumable item") : formatBonuses(itemBonuses(item))}</span>{isHeldConsumable && item.description ? <span className="inventory-consumable-description">{item.description}</span> : null}</button>{isEquipment ? <div className="equipment-card-actions"><div className="equipment-compare">{item.equipped ? <span>Currently equipped in this slot.</span> : <><span>Replaces: <strong>{current?.id ? `${current.name}${current.upgrade_level ? ` +${current.upgrade_level}` : ""}` : "Empty slot"}</strong></span><small>{equipmentDelta(item, current)}</small></>}</div>{isOwnProfile ? item.equipped ? <button type="button" className="equipment-action-button secondary" disabled={!equipmentActionsAvailable || Boolean(busyKey)} onClick={() => unequip(group.key)}>{itemBusy ? "Working…" : "Unequip"}</button> : <button type="button" className="equipment-action-button" disabled={!equipmentActionsAvailable || !canUse.eligible || Boolean(busyKey)} title={!canUse.eligible ? canUse.reason : undefined} onClick={() => equip(item)}>{itemBusy ? "Working…" : canUse.eligible ? "Equip" : canUse.reason}</button> : null}</div> : null}</article>; })}</div> : <div className="muted inventory-group-empty">No {group.label.toLowerCase()} match the current search.</div>}</section>)}</div>
    </section>
  );
}
