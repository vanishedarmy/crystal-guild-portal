import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitBuyItem,
  submitSellItem,
  submitShopState,
  waitForPortalAction,
} from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, formatBestUse, formatBonuses, formatItemUse, number } from "../utils/formatters.js";
import { handleTabListKeyDown } from "../utils/tabKeyboard.js";
import { loadGuideData, mergeItemListWithCatalog } from "../utils/itemCatalog.js";
import ItemArtwork from "../components/ItemArtwork.jsx";
import { beginQuantityEdit, clampQuantity, finishQuantityEdit, quantityInputValue, updateQuantityInput } from "../utils/quantityInput.js";
import ContextHelp from "../components/ContextHelp.jsx";


const EQUIPMENT_TYPES = new Set(["weapon", "armor", "accessory"]);
const STAT_LABELS = { attack: "ATK", magic_power: "M.PWR", str: "STR", vit: "VIT", mag: "MAG", spr: "SPR", dex: "DEX", lck: "LCK", hp: "HP" };

function itemBonuses(item) {
  return item?.effective_bonuses || item?.bonuses || {};
}

function equipmentDelta(item, current) {
  const next = itemBonuses(item);
  const prior = itemBonuses(current);
  const keys = [...new Set([...Object.keys(next), ...Object.keys(prior)])];
  const parts = keys
    .map((key) => [key, Number(next[key] || 0) - Number(prior[key] || 0)])
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => `${STAT_LABELS[key] || key.toUpperCase()} ${value > 0 ? "+" : ""}${value}`);
  return parts.length ? parts.join(" · ") : "No direct stat change";
}

function actionKey(kind, target = "shop") {
  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${kind}:${target}:${suffix}`;
}

function typeLabel(type) {
  const value = String(type || "item").toLowerCase();
  if (value === "consumable") return "Supply";
  return value.replace(/^./, (letter) => letter.toUpperCase());
}

function shopCategory(item) {
  const type = String(item?.type || "item").toLowerCase();
  if (type === "weapon") return "weapons";
  if (type === "armor" || type === "accessory") return "armor";
  return "items";
}

function shopLevel(item) {
  const value = Number(item?.min_level ?? item?.level ?? item?.shop_level);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function compareShopItems(left, right) {
  const leftEquipment = EQUIPMENT_TYPES.has(String(left?.type || "").toLowerCase());
  const rightEquipment = EQUIPMENT_TYPES.has(String(right?.type || "").toLowerCase());
  if (leftEquipment && rightEquipment) return shopLevel(right) - shopLevel(left)
    || String(left?.type || "").localeCompare(String(right?.type || ""))
    || String(left?.name || "").localeCompare(String(right?.name || ""));
  return shopLevel(left) - shopLevel(right)
    || String(left?.type || "").localeCompare(String(right?.type || ""))
    || String(left?.name || "").localeCompare(String(right?.name || ""));
}

async function finishedAction(response) {
  const action = response?.action;
  if (!action?.id) throw new Error("Crystal Guild did not return a request ID.");
  if (action.status === "completed" || action.status === "failed") return action;
  return waitForPortalAction(action.id, { attempts: 28, delayMs: 650 });
}

export default function MoogleEmporium({ data, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [shop, setShop] = useState(null);
  const [busyKey, setBusyKey] = useState("");
  const [message, setMessage] = useState("");
  const [buyQty, setBuyQty] = useState({});
  const [sellQty, setSellQty] = useState({});
  const [clock, setClock] = useState(() => Date.now());
  const [guideData, setGuideData] = useState(null);
  const [mode, setMode] = useState("buy");
  const [category, setCategory] = useState("weapons");

  const playerUsername = String(data?.player?.username || overview?.identity?.username || "").toLowerCase();
  const isOwnProfile = Boolean(
    auth.authenticated
    && auth.player?.username
    && String(auth.player.username).toLowerCase() === playerUsername
  );
  const capabilities = useMemo(
    () => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []),
    [auth.action_capabilities],
  );
  const sellableItems = useMemo(() => (Array.isArray(data?.items) ? data.items : [])
    .filter((item) => item?.sellable && Number(item.quantity || 0) > 0)
    .map((item) => ({
      ...item,
      max_sell_quantity: Math.max(0, Number(item.quantity || 0) - (item.equipped ? 1 : 0)),
      sell_price: Number(item.sell_value || 0),
    }))
    .sort(compareShopItems), [data?.items]);

  const currentBySlot = useMemo(() => {
    const map = new Map();
    for (const entry of overview?.equipment || []) map.set(String(entry.slot || "").toLowerCase(), entry);
    return map;
  }, [overview?.equipment]);
  const displayedStock = useMemo(
    () => mergeItemListWithCatalog(Array.isArray(shop?.stock) ? shop.stock : [], guideData).sort(compareShopItems),
    [shop?.stock, guideData],
  );
  const filteredStock = useMemo(() => displayedStock.filter((item) => shopCategory(item) === category), [displayedStock, category]);
  const filteredSellableItems = useMemo(() => sellableItems.filter((item) => shopCategory(item) === category), [sellableItems, category]);

  const annexUnlocked = Boolean(shop?.annex_unlocked);
  const stockSlots = Number(shop?.stock_slots || (annexUnlocked ? 12 : 9));

  const shopActionsAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && capabilities.has("SHOP_STATE")
    && capabilities.has("BUY_ITEM")
    && capabilities.has("SELL_ITEM")
  );
  const csrfToken = auth.csrf_token || "";

  useEffect(() => {
    let cancelled = false;
    loadGuideData()
      .then((catalog) => { if (!cancelled) setGuideData(catalog); })
      .catch(() => { if (!cancelled) setGuideData(null); });
    return () => { cancelled = true; };
  }, []);

  const loadShop = useCallback(async ({ quiet = false } = {}) => {
    if (!shopActionsAvailable) return null;
    if (!quiet) {
      setBusyKey("shop-state");
      setMessage("Asking the Moogle for your current stock…");
    }
    try {
      const response = await submitShopState(csrfToken, actionKey("shop-state"));
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("The shop is still updating. Try again in a moment.");
        return null;
      }
      if (finished.status !== "completed" || finished.result?.ok === false) {
        setMessage(finished.result?.message || "The Moogle Emporium could not be loaded.");
        return null;
      }
      const next = finished.result?.data || null;
      if (!next || !Array.isArray(next.stock)) {
        setMessage("The shop could not be loaded completely. Try refreshing the Emporium.");
        return null;
      }
      setShop(next);
      if (!quiet) setMessage("Moogle Emporium updated.");
      return next;
    } catch (error) {
      setMessage(error.message);
      return null;
    } finally {
      if (!quiet) setBusyKey("");
    }
  }, [shopActionsAvailable, csrfToken]);

  useEffect(() => {
    if (!shopActionsAvailable) return;
    loadShop();
  }, [shopActionsAvailable, loadShop]);

  useEffect(() => {
    const deadline = Number(shop?.expires_at || 0) * 1000;
    if (!deadline) return undefined;
    setClock(Date.now());
    if (deadline <= Date.now()) return undefined;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [shop?.expires_at]);

  const runMutation = async (key, submit, successFallback) => {
    if (!shopActionsAvailable || busyKey) return;
    setBusyKey(key);
    setMessage("Processing transaction…");
    try {
      const response = await submit();
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("This transaction is still being processed. Please wait a moment before trying again.");
        return;
      }
      setMessage(finished.result?.message || successFallback);
      if (finished.status === "completed" && finished.result?.ok !== false) {
        await loadShop({ quiet: true });
        onRefresh?.();
        window.setTimeout(() => onRefresh?.(), 3200);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey("");
    }
  };

  const buy = (item) => {
    const max = item.equipment ? 1 : 99;
    const quantity = item.equipment ? 1 : clampQuantity(buyQty[item.id] ?? 1, max);
    return runMutation(
      `buy:${item.id}`,
      () => submitBuyItem(item.id, quantity, csrfToken, actionKey("buy", item.id)),
      "Purchase complete.",
    );
  };

  const sell = (item) => {
    const max = Math.max(1, Number(item.max_sell_quantity || 1));
    const quantity = clampQuantity(sellQty[item.id] ?? 1, max);
    return runMutation(
      `sell:${item.id}`,
      () => submitSellItem(item.id, quantity, csrfToken, actionKey("sell", item.id)),
      "Sale complete.",
    );
  };

  const shopRemaining = shop?.expires_at ? Math.max(0, Math.ceil(((Number(shop.expires_at) * 1000) - clock) / 1000)) : 0;
  const expiresText = shop?.expires_at ? (shopRemaining > 0 ? duration(shopRemaining) : "Ready") : "—";

  if (!isOwnProfile) {
    return (
      <section className="panel moogle-panel">
        <div className="panel-title-row"><h2>Moogle Emporium</h2><span className="small-badge">Personal shop</span></div>
        <div className="moogle-access-note">
          <strong>This Emporium belongs to its adventurer.</strong>
          <span>Sign in with the Twitch account linked to this character to view their personal rotation or make transactions.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="panel moogle-panel">
      <div className="panel-title-row moogle-title-row">
        <div>
          <p className="eyebrow">Kupo commerce, regrettably legitimate</p>
          <h2>Moogle Emporium</h2>
        </div>
        <div className="context-help-actions"><ContextHelp topic="emporium" /><div className="moogle-wallet" aria-label={`${number(shop?.gil ?? overview?.identity?.gil ?? 0)} Gil`}>
          <strong>{number(shop?.gil ?? overview?.identity?.gil ?? 0)}</strong><span>Gil</span>
        </div></div>
      </div>

      <div className={`equipment-action-status ${shopActionsAvailable ? "ready" : "offline"}`}>
        <strong>{shopActionsAvailable ? "Emporium connection ready" : "Emporium controls unavailable"}</strong>
        <span>{shopActionsAvailable
          ? "Buy from your current stock or sell eligible items from your inventory. Prices and availability are checked again before every transaction."
          : "The shop is temporarily unavailable while Crystal Guild is offline."}</span>
        {message ? <small aria-live="polite">{message}</small> : null}
      </div>

      <div className="moogle-toolbar">
        <div className="moogle-shop-meta">
          <span><strong>{shop?.job_name || overview?.job?.name || "Adventurer"}</strong> stock</span>
          <span>Rotation refresh: <strong>{expiresText}</strong></span>
        </div>
        <button
          type="button"
          className="equipment-action-button secondary"
          disabled={!shopActionsAvailable || Boolean(busyKey)}
          onClick={() => loadShop()}
        >
          {busyKey === "shop-state" ? "Refreshing…" : "Refresh stock"}
        </button>
      </div>

      {shop ? (
        <div className={`moogle-annex-status ${annexUnlocked ? "open" : "closed"}`}>
          <div><span className="panel-kicker">Guild Expansion</span><strong>Moogle Emporium Annex</strong></div>
          <div><strong>{annexUnlocked ? "OPEN" : "NOT BUILT"}</strong><span>{number(stockSlots)} stock slots</span></div>
          <small>{annexUnlocked
            ? "The completed Annex adds three extra choices to every personal Emporium rotation."
            : "The Fellowship can construct the Annex to expand personal rotations from 9 to 12 items."}</small>
        </div>
      ) : null}

      {!shop && shopActionsAvailable ? <div className="state-message compact-state">Loading your current Moogle rotation…</div> : null}
      {!shop && !shopActionsAvailable ? <div className="state-message compact-state">Current stock becomes available when Crystal Guild reconnects.</div> : null}

      {shop ? (
        <>
          {shop.combat_locked ? (
            <div className="moogle-combat-lock">Transactions are locked while this adventurer is committed to an active encounter or raid.</div>
          ) : null}
          <div className="moogle-commerce-tabs" role="tablist" aria-label="Moogle Emporium transaction mode" aria-orientation="horizontal" onKeyDown={(event) => handleTabListKeyDown(event, setMode)}>
            <button type="button" role="tab" id="moogle-mode-buy" data-tab-value="buy" tabIndex={mode === "buy" ? 0 : -1} aria-controls="moogle-mode-panel" aria-selected={mode === "buy"} className={mode === "buy" ? "active" : ""} onClick={() => setMode("buy")}><span>Buy</span><small>Current Moogle stock</small></button>
            <button type="button" role="tab" id="moogle-mode-sell" data-tab-value="sell" tabIndex={mode === "sell" ? 0 : -1} aria-controls="moogle-mode-panel" aria-selected={mode === "sell"} className={mode === "sell" ? "active" : ""} onClick={() => setMode("sell")}><span>Sell</span><small>Your eligible inventory</small></button>
          </div>
          <div className="moogle-category-tabs" role="tablist" aria-label={`${mode === "buy" ? "Buy" : "Sell"} category`} aria-orientation="horizontal" onKeyDown={(event) => handleTabListKeyDown(event, setCategory)}>
            {[["weapons", "Weapons"], ["armor", "Armor"], ["items", "Items"]].map(([value, label]) => (
              <button key={value} type="button" role="tab" id={`moogle-category-${value}`} data-tab-value={value} tabIndex={category === value ? 0 : -1} aria-controls="moogle-mode-panel" aria-selected={category === value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{label}</button>
            ))}
          </div>

          {mode === "buy" ? (
            <div id="moogle-mode-panel" className="moogle-stock-grid" role="tabpanel" tabIndex="0" aria-labelledby={`moogle-mode-${mode} moogle-category-${category}`}>
              {filteredStock.length ? filteredStock.map((item) => {
                const max = item.equipment ? 1 : 99;
                const quantity = item.equipment ? 1 : clampQuantity(buyQty[item.id] ?? 1, max);
                const total = Number(item.price || 0) * quantity;
                const affordable = Number(shop.gil || 0) >= total;
                const busy = busyKey === `buy:${item.id}`;
                return (
                  <article className="moogle-item-card" key={item.id}>
                    <div className="moogle-item-head">
                      <ItemArtwork item={item} className="moogle-item-artwork" />
                      <span className="slot-label">{typeLabel(item.type)}</span>
                      <span className={`item-name rarity-${item.rarity || "common"}`}>{item.name}</span>
                    </div>
                    <div className="moogle-item-price"><strong>{number(item.price)}</strong><span>Gil</span></div>
                    <div className="card-meta">Owned {number(item.owned)} · {String(item.rarity || "common").replace(/^./, (c) => c.toUpperCase())}</div>
                    {Array.isArray(item?.use?.effects) && item.use.effects.length ? (
                      <p className="moogle-item-brief">{formatItemUse(item.use)}</p>
                    ) : null}
                    {item.equipment && Object.keys(itemBonuses(item)).length ? (
                      <div className="moogle-stat-summary">
                        <span className="moogle-stat-label">Stat boosts</span>
                        <strong>{formatBonuses(itemBonuses(item))}</strong>
                        {EQUIPMENT_TYPES.has(String(item.type || "").toLowerCase()) ? (() => {
                          const slot = String(item.type || "").toLowerCase();
                          const current = currentBySlot.get(slot);
                          if (!current?.id) return <small>Compared with empty {typeLabel(slot).toLowerCase()} slot: all listed boosts are gained.</small>;
                          return <small>Compared with current {typeLabel(slot).toLowerCase()}: {equipmentDelta(item, current)}</small>;
                        })() : null}
                      </div>
                    ) : null}
                    {["weapon", "armor"].includes(String(item.type || "").toLowerCase()) ? <div className="moogle-requirement equipment-job-recommendation">{formatBestUse(item)}</div> : null}
                    {Number(item.min_level || 1) > 1 ? <div className="moogle-requirement">Requires Lv. {number(item.min_level)}</div> : null}
                    <div className="moogle-card-actions">
                      {!item.equipment ? <label className="moogle-quantity"><span>Qty</span><input type="number" inputMode="numeric" min="1" max="99" value={quantityInputValue(buyQty, item.id)} onFocus={() => beginQuantityEdit(setBuyQty, buyQty, item.id)} onChange={(event) => updateQuantityInput(setBuyQty, item.id, event.target.value, 99)} onBlur={(event) => finishQuantityEdit(setBuyQty, item.id, event.target.value, 99)} /></label> : <span className="moogle-fixed-quantity">Qty 1</span>}
                      <button type="button" className="equipment-action-button" disabled={!shopActionsAvailable || shop.combat_locked || !affordable || Boolean(busyKey)} onClick={() => buy(item)}>{busy ? "Buying…" : (affordable ? `Buy ${item.name} · ${number(total)}g` : `Need ${number(total)}g`)}</button>
                    </div>
                  </article>
                );
              }) : <div className="state-message compact-state moogle-empty-category">No {category} are available in this rotation.</div>}
            </div>
          ) : (
            <div id="moogle-mode-panel" className="moogle-sell-grid moogle-sell-panel" role="tabpanel" tabIndex="0" aria-labelledby={`moogle-mode-${mode} moogle-category-${category}`}>
              {filteredSellableItems.length ? filteredSellableItems.map((item) => {
                const max = Number(item.max_sell_quantity || 0);
                const quantity = clampQuantity(sellQty[item.id] ?? 1, Math.max(1, max));
                const proceeds = Number(item.sell_price || 0) * quantity;
                const busy = busyKey === `sell:${item.id}`;
                return (
                  <article className="moogle-sell-row" key={item.id}>
                    <div className="moogle-sell-copy">
                      <ItemArtwork item={item} className="moogle-sell-item-artwork" />
                      <span className="slot-label">{typeLabel(item.type)}</span>
                      <span className={`item-name rarity-${item.rarity || "common"}`}>{item.name}</span>
                      <span>Owned {number(item.quantity)} · {number(item.sell_price)}g each{item.equipped ? " · Equipped" : ""}</span>
                      {["weapon", "armor"].includes(String(item.type || "").toLowerCase()) ? <small className="equipment-job-recommendation">{formatBestUse(item)}</small> : null}
                      {Array.isArray(item?.use?.effects) && item.use.effects.length ? <small className="moogle-item-brief">{formatItemUse(item.use)}</small> : null}
                      {max <= 0 ? <small>Unequip this item before selling your last copy.</small> : null}
                    </div>
                    <div className="moogle-card-actions sell-actions">
                      <label className="moogle-quantity"><span>Qty</span><input type="number" inputMode="numeric" min="1" max={Math.max(1, max)} value={quantityInputValue(sellQty, item.id)} disabled={max <= 0} onFocus={() => beginQuantityEdit(setSellQty, sellQty, item.id)} onChange={(event) => updateQuantityInput(setSellQty, item.id, event.target.value, Math.max(1, max))} onBlur={(event) => finishQuantityEdit(setSellQty, item.id, event.target.value, Math.max(1, max))} /></label>
                      <button type="button" className="equipment-action-button secondary" disabled={!shopActionsAvailable || shop.combat_locked || max <= 0 || Boolean(busyKey)} onClick={() => sell(item)}>{busy ? "Selling…" : `Sell ${item.name} · ${number(proceeds)}g`}</button>
                    </div>
                  </article>
                );
              }) : <div className="state-message compact-state moogle-empty-category">No sellable {category} are currently in your inventory.</div>}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
