import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchGearFavorites,
  saveGearFavorites,
  submitEquipItem,
  submitRecoveryState,
  submitStartRest,
  submitUnequipSlot,
  submitUseFieldItem,
  waitForPortalAction,
} from "../api/auth.js";
import ProgressBar from "../components/ProgressBar.jsx";
import ItemArtwork from "../components/ItemArtwork.jsx";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { campRemainingSeconds } from "../utils/campCountdown.js";
import { duration, formatBestUse, formatBonuses, formatItemUse, number, pct } from "../utils/formatters.js";
import CollapsePointer from "../components/CollapsePointer.jsx";
import ContextHelp from "../components/ContextHelp.jsx";

const GROUP_ORDER = ["weapon", "armor", "accessory", "item", "material"];
const GROUP_LABELS = { weapon: "Weapons", armor: "Armor", accessory: "Accessories", item: "Consumables", material: "Materials" };
const INVENTORY_GROUP_STATE_KEY = "crystal-guild:inventory-groups:v1";
const LEGACY_GEAR_FAVORITES_KEY_PREFIX = "crystal-guild:gear-favorites:v1";
const LEGACY_PENDING_GEAR_FAVORITES_KEY_PREFIX = "crystal-guild:gear-favorites-pending:v2";
const PENDING_GEAR_FAVORITES_KEY_PREFIX = "crystal-guild:gear-favorites-pending:v3";
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
function itemLevel(item) {
  const value = Number(item?.min_level ?? item?.level ?? item?.shop_level ?? 1);
  return Number.isFinite(value) ? Math.max(1, value) : 1;
}
function compareGearByLevel(left, right) {
  return itemLevel(right) - itemLevel(left) || String(left?.name || "").localeCompare(String(right?.name || ""));
}
function compareInventoryItems(left, right) { return String(left?.name || "").localeCompare(String(right?.name || "")); }
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
  if (Number(overview.identity?.level || 1) < requiredLevel) return { eligible: false, reason: `Requires Lv. ${requiredLevel}` };
  const allowed = Array.isArray(item.allowed_job_ids) ? item.allowed_job_ids : [];
  if (allowed.length && !allowed.includes(overview.job?.id)) return { eligible: false, reason: `Not usable by ${overview.job?.name || "current Job"}` };
  return { eligible: true, reason: "" };
}
function stateActionResult(action, fallback) { return action?.result?.message || fallback; }
function storedFavoriteList(key) {
  try {
    const stored = JSON.parse(globalThis.localStorage?.getItem(key) || "[]");
    return Array.isArray(stored) ? stored.map(String) : [];
  } catch { return []; }
}
function favoriteSignature(ids) { return [...ids].map(String).sort().join("\n"); }
function favoriteActionKey() {
  const suffix = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `gear-favorites:${suffix}`;
}
function hasStoredFavoriteState(key) {
  try { return globalThis.localStorage?.getItem(key) != null; } catch { return false; }
}

function quickRecoveryText(item, catalogItem) {
  const text = catalogItem?.use?.effects?.length
    ? formatItemUse(catalogItem.use)
    : String(catalogItem?.description || item?.description || "Recovery item").replace(/\s+/g, " ").trim();
  return text.length > 96 ? `${text.slice(0, 93).trimEnd()}…` : text;
}

export default function Inventory({ data, overview, onDetail, onRefresh }) {
  const { auth } = usePortalAuth();
  const [search, setSearch] = useState("");
  const [inventoryView, setInventoryView] = useState("inventory");
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [favoriteSyncReady, setFavoriteSyncReady] = useState(false);
  const [favoriteSyncMessage, setFavoriteSyncMessage] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [recoveryState, setRecoveryState] = useState(null);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryTarget, setRecoveryTarget] = useState("");
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [openGroups, setOpenGroups] = useState(() => {
    const defaults = Object.fromEntries(GROUP_ORDER.map((group) => [group, true]));
    try {
      const stored = JSON.parse(globalThis.localStorage?.getItem(INVENTORY_GROUP_STATE_KEY) || "{}");
      for (const group of GROUP_ORDER) if (typeof stored?.[group] === "boolean") defaults[group] = stored[group];
    } catch {}
    return defaults;
  });
  const recoveryLoadedFor = useRef("");
  const expiryRefreshFor = useRef(0);
  const favoriteSaveQueue = useRef(Promise.resolve());
  const favoriteLatestSignature = useRef("");
  const favoriteSyncMounted = useRef(true);

  const isOwnProfile = Boolean(auth.authenticated && auth.player?.username && String(auth.player.username).toLowerCase() === String(data.player?.username || "").toLowerCase());
  const capabilities = new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []);
  const equipmentActionsAvailable = Boolean(isOwnProfile && auth.actions_enabled && capabilities.has("EQUIP_ITEM") && capabilities.has("UNEQUIP_SLOT"));
  const recoveryActionsAvailable = Boolean(isOwnProfile && auth.actions_enabled && capabilities.has("RECOVERY_STATE") && capabilities.has("USE_FIELD_ITEM") && capabilities.has("START_REST"));

  const currentBySlot = useMemo(() => { const map = new Map(); for (const entry of overview?.equipment || []) map.set(entry.slot, entry); return map; }, [overview?.equipment]);
  const loadoutSlots = useMemo(() => ["weapon", "armor", "accessory"].map((slot) => ({ slot, item: currentBySlot.get(slot) || null })), [currentBySlot]);
  const recoveryQuantities = useMemo(() => new Map((recoveryState?.items || []).map((item) => [item.id, Number(item.quantity || 0)])), [recoveryState]);
  const recoveryCatalogById = useMemo(() => new Map((data.items || []).map((item) => [item.id, item])), [data.items]);
  const displayedItems = useMemo(() => data.items.map((item) => recoveryQuantities.has(item.id) ? { ...item, quantity: recoveryQuantities.get(item.id) } : item).filter((item) => Number(item.quantity || 0) > 0), [data.items, recoveryQuantities]);
  const favoriteStorageKey = `${LEGACY_GEAR_FAVORITES_KEY_PREFIX}:${String(data.player?.username || "unknown").toLowerCase()}`;
  const legacyPendingFavoriteStorageKey = `${LEGACY_PENDING_GEAR_FAVORITES_KEY_PREFIX}:${String(data.player?.username || "unknown").toLowerCase()}`;
  const pendingFavoriteStorageKey = `${PENDING_GEAR_FAVORITES_KEY_PREFIX}:${String(data.player?.username || "unknown").toLowerCase()}`;

  const commitFavoriteSave = async (favorites) => {
    const response = await saveGearFavorites(favorites, auth.csrf_token, favoriteActionKey());
    const accepted = response?.action;
    if (!accepted?.id) return { committed: false, pending: true, action: null };
    if (accepted.status === "completed") {
      if (accepted.result?.ok === false) throw new Error(accepted.result?.message || "Favorites could not be saved by Crystal Guild.");
      return { committed: true, pending: false, action: accepted };
    }
    if (accepted.status === "failed") throw new Error(accepted.result?.message || "Favorites could not be saved by Crystal Guild.");
    const finished = await waitForPortalAction(accepted.id, { attempts: 40, delayMs: 500 });
    if (!finished) return { committed: false, pending: true, action: accepted };
    if (finished.status === "failed" || finished.result?.ok === false) {
      throw new Error(finished.result?.message || "Favorites could not be saved by Crystal Guild.");
    }
    return { committed: finished.status === "completed", pending: finished.status !== "completed", action: finished };
  };

  const clearFavoriteMigrationState = () => {
    try {
      globalThis.localStorage?.removeItem(pendingFavoriteStorageKey);
      globalThis.localStorage?.removeItem(legacyPendingFavoriteStorageKey);
      globalThis.localStorage?.removeItem(favoriteStorageKey);
    } catch {}
  };

  const queueFavoriteSave = (nextIds) => {
    const favorites = [...nextIds].map(String);
    const signature = favoriteSignature(favorites);
    favoriteLatestSignature.current = signature;
    try { globalThis.localStorage?.setItem(pendingFavoriteStorageKey, JSON.stringify(favorites)); } catch {}
    setFavoriteSyncMessage("Sharing Favorites across devices…");
    favoriteSaveQueue.current = favoriteSaveQueue.current
      .catch(() => null)
      .then(() => commitFavoriteSave(favorites))
      .then(({ committed, pending }) => {
        if (!favoriteSyncMounted.current || favoriteLatestSignature.current !== signature) return;
        if (committed) {
          clearFavoriteMigrationState();
          setFavoriteSyncMessage("Favorites saved to your Guild profile and synced across devices.");
          onRefresh?.();
        } else if (pending) {
          setFavoriteSyncMessage("Favorites are shared across devices; the Guild database save is still pending.");
        }
      })
      .catch((error) => {
        if (!favoriteSyncMounted.current || favoriteLatestSignature.current !== signature) return;
        setFavoriteSyncMessage(error?.message || "Favorites could not sync. This browser will keep the pending change for retry.");
      });
  };

  useEffect(() => {
    favoriteSyncMounted.current = true;
    if (!isOwnProfile) {
      setFavoriteIds(new Set());
      setFavoriteSyncReady(false);
      setFavoriteSyncMessage("");
      return () => { favoriteSyncMounted.current = false; };
    }
    const controller = new AbortController();
    let active = true;
    const legacyBrowser = storedFavoriteList(favoriteStorageKey);
    const legacyPending = storedFavoriteList(legacyPendingFavoriteStorageKey);
    const legacy = [...new Set([...legacyBrowser, ...legacyPending])];
    const pendingExists = hasStoredFavoriteState(pendingFavoriteStorageKey);
    const pending = storedFavoriteList(pendingFavoriteStorageKey);
    const localInitial = pendingExists ? pending : legacy;
    setFavoriteIds(new Set(localInitial));
    setFavoriteSyncReady(false);
    setFavoriteSyncMessage(localInitial.length ? "Syncing Favorites…" : "Loading synced Favorites…");

    (async () => {
      try {
        const remote = await fetchGearFavorites(controller.signal);
        if (!active) return;
        const remoteIds = Array.isArray(remote?.favorites) ? remote.favorites.map(String) : [];
        let desired;
        let shouldSave = false;
        if (pendingExists) {
          desired = [...new Set(pending)];
          shouldSave = true;
        } else {
          desired = [...new Set([...remoteIds, ...legacy])];
          shouldSave = Boolean(remote?.needs_authoritative_save)
            || (legacy.length > 0 && favoriteSignature(desired) !== favoriteSignature(remoteIds));
        }
        setFavoriteIds(new Set(desired));
        favoriteLatestSignature.current = favoriteSignature(desired);
        if (shouldSave) {
          try { globalThis.localStorage?.setItem(pendingFavoriteStorageKey, JSON.stringify(desired)); } catch {}
          const result = await commitFavoriteSave(desired);
          if (!active) return;
          if (result.committed) {
            clearFavoriteMigrationState();
            setFavoriteSyncMessage(legacy.length ? "Existing Favorites migrated to your Guild profile and synced across devices." : "Favorites saved to your Guild profile and synced across devices.");
            onRefresh?.();
          } else {
            setFavoriteSyncMessage("Favorites are shared across devices; the Guild database save is still pending.");
          }
        } else {
          clearFavoriteMigrationState();
          setFavoriteSyncMessage("Favorites loaded from your Guild profile.");
        }
      } catch (error) {
        if (!active || error?.name === "AbortError") return;
        setFavoriteSyncMessage("Favorites sync is temporarily unavailable. This browser's saved Favorites are still shown.");
      } finally {
        if (active) setFavoriteSyncReady(true);
      }
    })();

    return () => {
      active = false;
      favoriteSyncMounted.current = false;
      controller.abort();
    };
  }, [favoriteStorageKey, legacyPendingFavoriteStorageKey, pendingFavoriteStorageKey, isOwnProfile, auth.csrf_token]);

  useEffect(() => {
    if (!isOwnProfile) return undefined;
    let active = true;
    const refreshSyncedFavorites = async () => {
      try {
        const remote = await fetchGearFavorites();
        if (!active) return;
        const remoteIds = Array.isArray(remote?.favorites) ? remote.favorites.map(String) : [];
        const pendingExists = hasStoredFavoriteState(pendingFavoriteStorageKey);
        const localPending = pendingExists ? storedFavoriteList(pendingFavoriteStorageKey) : [];
        if (pendingExists && favoriteSignature(localPending) !== favoriteSignature(remoteIds)) {
          // Keep this browser's newest optimistic write until the hosted mirror
          // catches up; another device still receives that mirror immediately.
          return;
        }
        if (pendingExists && !remote?.needs_authoritative_save) clearFavoriteMigrationState();
        setFavoriteIds(new Set(remoteIds));
        favoriteLatestSignature.current = favoriteSignature(remoteIds);
        setFavoriteSyncMessage(remote?.needs_authoritative_save
          ? "Favorites are shared across devices; the Guild database save is still pending."
          : "Favorites loaded from your Guild profile.");
      } catch {}
    };
    const onVisible = () => { if (document.visibilityState !== "hidden") refreshSyncedFavorites(); };
    const timer = window.setInterval(refreshSyncedFavorites, 120000);
    window.addEventListener("crystal-guild-live-revision", refreshSyncedFavorites);
    window.addEventListener("focus", refreshSyncedFavorites);
    window.addEventListener("pageshow", refreshSyncedFavorites);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshSyncedFavorites);
      window.removeEventListener("pageshow", refreshSyncedFavorites);
      window.removeEventListener("crystal-guild-live-revision", refreshSyncedFavorites);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isOwnProfile, pendingFavoriteStorageKey]);

  const toggleFavorite = (itemId) => {
    if (!favoriteSyncReady) return;
    const id = String(itemId);
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      queueFavoriteSave(next);
      return next;
    });
  };
  const filtered = useMemo(() => { const term = search.trim().toLowerCase(); return displayedItems.filter((item) => !term || item.name.toLowerCase().includes(term)); }, [displayedItems, search]);
  const favoriteGear = useMemo(() => filtered.filter((item) => EQUIPMENT_GROUPS.has(groupForItem(item)) && favoriteIds.has(String(item.id))).sort(compareGearByLevel), [filtered, favoriteIds]);
  const grouped = useMemo(() => {
    const buckets = new Map(GROUP_ORDER.map((group) => [group, []]));
    for (const item of filtered) {
      const group = groupForItem(item);
      if (isOwnProfile && EQUIPMENT_GROUPS.has(group) && favoriteIds.has(String(item.id))) continue;
      buckets.get(group)?.push(item);
    }
    return GROUP_ORDER.map((group) => ({ key: group, label: GROUP_LABELS[group], items: [...(buckets.get(group) || [])].sort(EQUIPMENT_GROUPS.has(group) ? compareGearByLevel : compareInventoryItems) }));
  }, [filtered, favoriteIds, isOwnProfile]);
  const toggleGroup = (group) => setOpenGroups((current) => {
    const next = { ...current, [group]: current[group] === false };
    try { globalThis.localStorage?.setItem(INVENTORY_GROUP_STATE_KEY, JSON.stringify(next)); } catch {}
    return next;
  });

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
    const target = String(recoveryTarget || "").trim().replace(/^@/, "");
    const targetLabel = target ? ` on @${target}` : "";
    if (item.confirm && !window.confirm(`Use ${item.name}${targetLabel} now?`)) return;
    await runQueuedAction(`use:${item.id}:${target || "self"}`, () => submitUseFieldItem(item.id, auth.csrf_token, actionKey("use-item", `${item.id}:${target || "self"}`), target), `${item.name} used.`, (finished, message) => {
      setRecoveryMessage(message); const state = finished?.result?.data?.recovery_state; if (state) setRecoveryState(state); if (finished?.status === "completed") onRefresh?.();
    });
  };
  const startRest = () => runQueuedAction("start-rest", () => submitStartRest(auth.csrf_token, actionKey("start-rest")), "Camp updated.", (finished, message) => {
    setRecoveryMessage(message); const state = finished?.result?.data?.recovery_state; if (state) setRecoveryState(state); if (finished?.status === "completed") onRefresh?.();
  });

  const renderInventoryCard = (item, groupKey, index, { favorite = false } = {}) => {
    const upgrade = item.upgrade_level ? ` +${item.upgrade_level}` : "";
    const rawType = String(item.type || "").toLowerCase();
    const isHeldConsumable = groupKey === "item" && !["accessory", "weapon", "armor", "material"].includes(rawType);
    const isEquipment = EQUIPMENT_GROUPS.has(groupKey);
    const current = isEquipment ? currentBySlot.get(groupKey) : null;
    const canUse = eligibility(item, overview);
    const itemBusy = busyKey === `equip:${item.id}` || busyKey === `unequip:${groupKey}`;
    const isFavorite = favorite || favoriteIds.has(String(item.id));
    return (
      <article className={`inventory-card inventory-action-card ${item.equipped ? "is-equipped" : ""} ${isFavorite ? "is-favorite" : ""}`} key={`${groupKey}-${item.id || item.name}-${index}`}>
        <button type="button" className="inventory-card-detail" onClick={() => onDetail?.({ type: "inventory", inventoryGroup: groupKey, item })}>
          <ItemArtwork item={item} className="inventory-item-artwork" />
          <span className="slot-label">{slotLabel(item)}{isEquipment ? ` · Lv. ${number(itemLevel(item))}` : ""}</span>
          {item.equipped ? <span className="inventory-equipped-chip">Equipped now</span> : null}
          <span className={`item-name rarity-${item.rarity}`}>{item.name}{upgrade}</span>
          <span className="card-meta">Quantity {number(item.quantity)} · {String(item.rarity || "common").replace(/^./, (c) => c.toUpperCase())}</span>
          <span className="item-meta">{isHeldConsumable ? (item.use?.effects?.length ? formatItemUse(item.use) : item.description || "Consumable item") : formatBonuses(itemBonuses(item))}</span>
          {["weapon", "armor"].includes(rawType) ? <small className="equipment-job-recommendation">{formatBestUse(item)}</small> : null}
          {isHeldConsumable && item.description ? <span className="inventory-consumable-description">{item.description}</span> : null}
        </button>
        {isEquipment ? <div className="equipment-card-actions">
          <div className="equipment-compare">{item.equipped ? <span>Currently equipped in this slot.</span> : <small>{equipmentDelta(item, current)}</small>}</div>
          {isOwnProfile ? <button type="button" className={`gear-favorite-button ${isFavorite ? "active" : ""}`} aria-pressed={isFavorite} aria-label={isFavorite ? `Remove ${item.name} from Favorites` : `Add ${item.name} to Favorites`} title={!favoriteSyncReady ? "Syncing Favorites…" : isFavorite ? "Remove from Favorites" : "Add to Favorites"} disabled={!favoriteSyncReady} onClick={() => toggleFavorite(item.id)}>{isFavorite ? "★" : "☆"}</button> : null}
          {isOwnProfile ? item.equipped ? <button type="button" className="equipment-action-button secondary" disabled={!equipmentActionsAvailable || Boolean(busyKey)} onClick={() => unequip(groupKey)}>{itemBusy ? "Working…" : `Unequip ${item.name}`}</button> : <button type="button" className="equipment-action-button" disabled={!equipmentActionsAvailable || !canUse.eligible || Boolean(busyKey)} title={!canUse.eligible ? canUse.reason : undefined} onClick={() => equip(item)}>{itemBusy ? "Working…" : canUse.eligible ? `Equip ${item.name}` : canUse.reason}</button> : null}
        </div> : null}
      </article>
    );
  };

  const targetingOther = Boolean(String(recoveryTarget || "").trim());
  const recoveryItems = (recoveryState?.items || []).filter((item) => item.field_usable && (targetingOther || item.usable_now));
  const stateLabel = recoveryState?.state_label || (overview?.status?.label || "READY");

  return (
    <section className="panel inventory-phase-five">
      <div className="panel-title-row"><h2>Equipment, Inventory & Recovery</h2><div className="context-help-actions"><ContextHelp topic="inventory" /><span className="small-badge">{filtered.length} shown · {displayedItems.length} stacks</span></div></div>

      {isOwnProfile ? (
        <section className="recovery-dashboard" aria-label="Recovery">
          <div className="recovery-heading">
            <div><p className="eyebrow">Recovery</p><h3>{stateLabel}</h3></div>
          </div>
          <div className="recovery-resource-grid">
            <div className="recovery-resource"><span><b>HP</b><em>{number(recoveryState?.hp?.current ?? overview?.hp?.current)} / {number(recoveryState?.hp?.max ?? overview?.hp?.max)}</em></span><ProgressBar value={pct(recoveryState?.hp?.current ?? overview?.hp?.current, recoveryState?.hp?.max ?? overview?.hp?.max)} className="hp" /></div>
            {Number((recoveryState?.mp?.max ?? overview?.resources?.mp?.max) || 0) > 0 ? <div className="recovery-resource"><span><b>MP</b><em>{number(recoveryState?.mp?.current ?? overview?.resources?.mp?.current)} / {number(recoveryState?.mp?.max ?? overview?.resources?.mp?.max)}</em></span><ProgressBar value={pct(recoveryState?.mp?.current ?? overview?.resources?.mp?.current, recoveryState?.mp?.max ?? overview?.resources?.mp?.max)} className="mp" /></div> : null}
            {Number((recoveryState?.ap?.max ?? overview?.resources?.ap?.max) || 0) > 0 ? <div className="recovery-resource"><span><b>AP</b><em>{number(recoveryState?.ap?.current ?? overview?.resources?.ap?.current)} / {number(recoveryState?.ap?.max ?? overview?.resources?.ap?.max)}</em></span><ProgressBar value={pct(recoveryState?.ap?.current ?? overview?.resources?.ap?.current, recoveryState?.ap?.max ?? overview?.resources?.ap?.max)} className="ap" /></div> : null}
          </div>
          {recoveryState?.state === "resting" ? <div className="recovery-callout"><strong>Camp recovery in {duration(campRemaining)}</strong><span>Recovery time stays accurate even if you leave the page and come back.</span></div> : null}
          {recoveryState?.active_statuses?.length ? <div className="recovery-callout"><strong>Active Battle status</strong><span>{recoveryState.active_statuses.map((status) => `${status.name} (${status.turns}r)`).join(" · ")} — use status-curing items during battle.</span></div> : null}
          <label className="recovery-target-control">
            <span><strong>Field item target</strong><small>Leave blank for yourself. While the stream is LIVE, enter another adventurer's Twitch username to use recovery items on them outside battle.</small></span>
            <input type="text" inputMode="text" autoComplete="off" placeholder="Self · or Twitch username" value={recoveryTarget} onChange={(event) => setRecoveryTarget(event.target.value.replace(/^@/, ""))} />
          </label>
          <div className="recovery-actions-row">
            <button type="button" className="equipment-action-button" disabled={!recoveryActionsAvailable || Boolean(busyKey) || recoveryState?.state === "in_battle" || recoveryState?.state === "resting"} onClick={startRest}>{busyKey === "start-rest" ? "Starting…" : recoveryState?.state === "resting" ? "Already Resting" : "Start Camp"}</button>
            <span className="recovery-usable-summary">Camp: 15m LIVE · 1h OFFLINE · {recoveryItems.length ? `${recoveryItems.length} recovery ${recoveryItems.length === 1 ? "item" : "items"} ready` : "no item recovery needed"}</span>
          </div>
          {recoveryMessage ? <div className="recovery-result" aria-live="polite">{recoveryMessage}</div> : null}
          {recoveryItems.length ? <><div className="recovery-quick-grid">{recoveryItems.map((item) => { const target = String(recoveryTarget || "").trim().replace(/^@/, ""); const busy = busyKey === `use:${item.id}:${target || "self"}`; const catalogItem = recoveryCatalogById.get(item.id); return <button type="button" className="recovery-quick-action" key={item.id} aria-label={`Use ${item.name}${target ? ` on ${target}` : ""}`} disabled={!recoveryActionsAvailable || Boolean(busyKey)} onClick={() => useRecoveryItem(item)}><ItemArtwork item={item} className="recovery-item-artwork" /><span className="recovery-quick-copy"><strong className={`item-name rarity-${item.rarity}`}>{item.name}</strong><small>{quickRecoveryText(item, catalogItem)}</small></span><span className="recovery-quick-meta">Owned {number(item.quantity)} · {busy ? "Using…" : target ? `Use on @${target}` : "Use"}</span></button>; })}</div></> : <div className="muted recovery-empty">{recoveryState ? "No recovery item can be used right now." : "Recovery options will appear here when available."}</div>}
        </section>
      ) : null}

      {isOwnProfile ? <div className={`equipment-action-status ${equipmentActionsAvailable ? "ready" : "offline"}`}><strong>{equipmentActionsAvailable ? "Equipment controls ready" : "Equipment controls unavailable"}</strong><span>{equipmentActionsAvailable ? "Equip or unequip gear you own." : "Your inventory is still available to view."}</span>{actionMessage ? <small aria-live="polite">{actionMessage}</small> : null}</div> : null}

      <section className="current-loadout-summary" aria-label="Current equipment loadout">
        <div className="current-loadout-heading"><div><p className="eyebrow">Current Loadout</p><h3>Equipped right now</h3></div><span className="small-badge">Weapon · Armor · Accessory</span></div>
        <div className="current-loadout-grid">
          {loadoutSlots.map(({ slot, item }) => {
            const upgrade = item?.upgrade_level ? ` +${item.upgrade_level}` : "";
            const label = GROUP_LABELS[slot]?.replace(/s$/, "") || slot;
            const bonuses = item?.effective_bonuses || item?.bonuses || {};
            return <article className={`current-loadout-card ${item?.id ? "filled" : "empty"}`} key={slot}><div className="current-loadout-card-head"><span className="slot-label">{label}{item?.id ? ` · Lv. ${number(itemLevel(item))}` : ""}</span><span className={`loadout-status ${item?.id ? "equipped" : "empty"}`}>{item?.id ? "Equipped" : "Empty"}</span></div><strong className={item?.id ? `rarity-${item.rarity || "common"}` : "muted"}>{item?.id ? `${item.name}${upgrade}` : "Nothing equipped"}</strong><span className="item-meta">{item?.id ? formatBonuses(bonuses) : "No stat bonuses"}</span>{item?.id && ["weapon", "armor"].includes(slot) ? <small className="equipment-job-recommendation">{formatBestUse(item)}</small> : null}{item?.id ? <button type="button" className="current-loadout-detail" onClick={() => onDetail?.({ type: "equipment", item })}>View {item.name}</button> : null}</article>;
          })}
        </div>
      </section>

      {isOwnProfile ? (
        <div className="inventory-view-tabs" role="tablist" aria-label="Inventory gear views">
          <button type="button" role="tab" aria-selected={inventoryView === "inventory"} className={inventoryView === "inventory" ? "active" : ""} onClick={() => setInventoryView("inventory")}>Inventory</button>
          <button type="button" role="tab" aria-selected={inventoryView === "favorites"} className={inventoryView === "favorites" ? "active" : ""} onClick={() => setInventoryView("favorites")}>Favorites <span>{favoriteGear.length}</span></button>
        </div>
      ) : null}
      {isOwnProfile && favoriteSyncMessage ? <div className="inventory-favorites-sync" aria-live="polite">{favoriteSyncMessage}</div> : null}
      <div className="toolbar"><label className="search-box"><span>Search {inventoryView === "favorites" ? "Favorites" : "Inventory"}</span><input type="search" placeholder="Item name" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
      {isOwnProfile && inventoryView === "favorites" ? (
        <section className="inventory-favorites-panel">
          <div className="panel-title-row inventory-favorites-heading"><h3>Favorite Gear</h3><span className="small-badge">{favoriteGear.length} {favoriteGear.length === 1 ? "item" : "items"}</span></div>
          {favoriteGear.length ? <div className="content-grid inventory-equipment-grid">{favoriteGear.map((item, index) => renderInventoryCard(item, groupForItem(item), index, { favorite: true }))}</div> : <div className="muted inventory-group-empty">Favorite a weapon, armor piece, or accessory to keep it here.</div>}
        </section>
      ) : (
        <div className="inventory-section-list">
          {grouped.map((group) => {
            const isOpen = openGroups[group.key] !== false;
            const contentId = `inventory-group-${group.key}`;
            return (
              <section className={`inventory-group ${isOpen ? "is-open" : "is-collapsed"}`} key={group.key}>
                <button type="button" className="panel-title-row inventory-group-heading inventory-group-toggle" aria-expanded={isOpen} aria-controls={contentId} onClick={() => toggleGroup(group.key)}>
                  <h3>{group.label}</h3>
                  <span className="inventory-group-toggle-meta"><span className="small-badge">{group.items.length} {group.items.length === 1 ? "stack" : "stacks"}</span><CollapsePointer open={isOpen} className="inventory-group-toggle-icon" /></span>
                </button>
                <div id={contentId} hidden={!isOpen}>
                  {group.items.length ? <div className={`content-grid ${EQUIPMENT_GROUPS.has(group.key) ? "inventory-equipment-grid" : ""}`}>{group.items.map((item, index) => renderInventoryCard(item, group.key, index))}</div> : <div className="muted inventory-group-empty">No {group.label.toLowerCase()} match the current search.</div>}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
