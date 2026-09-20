import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitBuyItem,
  submitSellItem,
  submitShopState,
  submitTradingPostState,
  submitTradingPostList,
  submitTradingPostBuy,
  submitTradingPostCancel,
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
  const [market, setMarket] = useState(null);
  const [busyKey, setBusyKey] = useState("");
  const [message, setMessage] = useState("");
  const [buyQty, setBuyQty] = useState({});
  const [sellQty, setSellQty] = useState({});
  const [clock, setClock] = useState(() => Date.now());
  const [guideData, setGuideData] = useState(null);
  const [mode, setMode] = useState("buy");
  const [category, setCategory] = useState("weapons");
  const [marketView, setMarketView] = useState("browse");
  const [marketCategory, setMarketCategory] = useState("all");
  const [marketQty, setMarketQty] = useState({});
  const [marketPrice, setMarketPrice] = useState({});

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
  const marketListings = useMemo(() => (Array.isArray(market?.listings) ? market.listings : [])
    .filter((listing) => marketCategory === "all" || shopCategory(listing?.item) === marketCategory), [market?.listings, marketCategory]);
  const marketEligibleItems = useMemo(() => (Array.isArray(market?.eligible_items) ? market.eligible_items : [])
    .slice().sort(compareShopItems), [market?.eligible_items]);
  const ownMarketListings = useMemo(() => (Array.isArray(market?.my_listings) ? market.my_listings : []), [market?.my_listings]);

  const annexUnlocked = Boolean(shop?.annex_unlocked);
  const stockSlots = Number(shop?.stock_slots || (annexUnlocked ? 12 : 9));

  const shopActionsAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && capabilities.has("SHOP_STATE")
    && capabilities.has("BUY_ITEM")
    && capabilities.has("SELL_ITEM")
  );
  const tradingPostActionsAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && capabilities.has("TRADING_POST_STATE")
    && capabilities.has("TRADING_POST_LIST")
    && capabilities.has("TRADING_POST_BUY")
    && capabilities.has("TRADING_POST_CANCEL")
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

  const loadMarket = useCallback(async ({ quiet = false } = {}) => {
    if (!tradingPostActionsAvailable) return null;
    if (!quiet) {
      setBusyKey("market-state");
      setMessage("Checking the Trading Post ledger…");
    }
    try {
      const response = await submitTradingPostState(csrfToken, actionKey("market-state", "trading-post"));
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("The Trading Post is still updating. Try again in a moment.");
        return null;
      }
      if (finished.status !== "completed" || finished.result?.ok === false) {
        setMessage(finished.result?.message || "The Moogle Trading Post could not be loaded.");
        return null;
      }
      const next = finished.result?.data || null;
      if (!next || !Array.isArray(next.listings) || !Array.isArray(next.my_listings)) {
        setMessage("The Trading Post ledger could not be loaded completely.");
        return null;
      }
      setMarket(next);
      if (!quiet) setMessage(next.unlocked ? "Moogle Trading Post updated." : "The Fellowship has not built the Trading Post yet.");
      return next;
    } catch (error) {
      setMessage(error.message);
      return null;
    } finally {
      if (!quiet) setBusyKey("");
    }
  }, [tradingPostActionsAvailable, csrfToken]);

  useEffect(() => {
    if (!shopActionsAvailable) return;
    loadShop();
  }, [shopActionsAvailable, loadShop]);

  useEffect(() => {
    if (mode !== "market" || !tradingPostActionsAvailable) return;
    loadMarket();
  }, [mode, tradingPostActionsAvailable, loadMarket]);

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

  const runMarketMutation = async (key, submit, successFallback) => {
    if (!tradingPostActionsAvailable || busyKey) return;
    setBusyKey(key);
    setMessage("Updating the Trading Post ledger…");
    try {
      const response = await submit();
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("This Trading Post action is still being processed. Check again in a moment.");
        return;
      }
      setMessage(finished.result?.message || successFallback);
      if (finished.status === "completed" && finished.result?.ok !== false) {
        await Promise.all([loadMarket({ quiet: true }), loadShop({ quiet: true })]);
        onRefresh?.();
        window.setTimeout(() => onRefresh?.(), 3200);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey("");
    }
  };

  const listOnMarket = (item) => {
    const max = Math.max(1, Number(item.max_quantity || 1));
    const quantity = clampQuantity(marketQty[item.id] ?? 1, max);
    const unitPrice = Math.max(1, Math.min(1000000, Number(marketPrice[item.id] ?? item.reference_price ?? 1) || 1));
    return runMarketMutation(
      `market-list:${item.id}`,
      () => submitTradingPostList(item.id, quantity, unitPrice, csrfToken, actionKey("market-list", item.id)),
      "Listing posted.",
    );
  };

  const buyMarketListing = (listing) => runMarketMutation(
    `market-buy:${listing.id}`,
    () => submitTradingPostBuy(listing.id, csrfToken, actionKey("market-buy", listing.id)),
    "Trading Post purchase complete.",
  );

  const cancelMarketListing = (listing) => runMarketMutation(
    `market-cancel:${listing.id}`,
    () => submitTradingPostCancel(listing.id, csrfToken, actionKey("market-cancel", listing.id)),
    "Listing cancelled and items returned.",
  );

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
          ? "Buy or sell through the Emporium, or enter the Fellowship Trading Post for player-to-player listings. Prices and availability are checked again before every transaction."
          : "The shop is temporarily unavailable while Crystal Guild is offline."}</span>
        {message ? <small aria-live="polite">{message}</small> : null}
      </div>

      <div className="moogle-toolbar">
        <div className="moogle-shop-meta">
          <span><strong>{shop?.job_name || overview?.job?.name || "Adventurer"}</strong> stock</span>
          <span>Rotation refresh: <strong>{expiresText}</strong></span>
        </div>
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
            <button type="button" role="tab" id="moogle-mode-market" data-tab-value="market" tabIndex={mode === "market" ? 0 : -1} aria-controls="moogle-mode-panel" aria-selected={mode === "market"} className={mode === "market" ? "active" : ""} onClick={() => setMode("market")}><span>Trading Post</span><small>Player market</small></button>
          </div>
          {mode !== "market" ? (
            <div className="moogle-category-tabs" role="tablist" aria-label={`${mode === "buy" ? "Buy" : "Sell"} category`} aria-orientation="horizontal" onKeyDown={(event) => handleTabListKeyDown(event, setCategory)}>
              {[["weapons", "Weapons"], ["armor", "Armor"], ["items", "Items"]].map(([value, label]) => (
                <button key={value} type="button" role="tab" id={`moogle-category-${value}`} data-tab-value={value} tabIndex={category === value ? 0 : -1} aria-controls="moogle-mode-panel" aria-selected={category === value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{label}</button>
              ))}
            </div>
          ) : null}

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
          ) : mode === "sell" ? (
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
          ) : (
            <div id="moogle-mode-panel" className="trading-post-panel" role="tabpanel" tabIndex="0" aria-labelledby="moogle-mode-market">
              {!tradingPostActionsAvailable ? (
                <div className="state-message compact-state">Trading Post controls become available when the v1.9 Portal action service is connected.</div>
              ) : !market ? (
                <div className="state-message compact-state">Loading the Fellowship Trading Post…</div>
              ) : !market.unlocked ? (
                <div className="trading-post-locked">
                  <img src="/trading-post/a1/locked.png" alt="Locked Moogle Trading Post storefront" />
                  <div className="trading-post-locked-copy">
                    <span className="panel-kicker">Fellowship Building · Level 1</span>
                    <h3>Moogle Trading Post</h3>
                    <p>The player market opens after the Fellowship completes this construction project.</p>
                    {market.project?.requirements?.length ? (
                      <div className="trading-post-requirements">
                        {market.project.requirements.map((requirement) => (
                          <div key={requirement.key} className={requirement.complete ? "complete" : ""}>
                            <span>{requirement.label}</span>
                            <strong>{number(requirement.current)} / {number(requirement.target)}</strong>
                          </div>
                        ))}
                      </div>
                    ) : <small>Construction requirements: Fellowship LVL 1 · 25,000 Gil · 3 Mythril Ore · 15 Ventures.</small>}
                  </div>
                </div>
              ) : (
                <>
                  <div className="trading-post-hero">
                    <img src="/trading-post/a1/marketplace.png" alt="Moogle Trading Post marketplace" />
                    <div>
                      <span className="panel-kicker">Fellowship Player Market</span>
                      <h3>Moogle Trading Post</h3>
                      <p>Buy directly from other adventurers or post eligible gear, materials, and supplies for a fixed Gil price.</p>
                      <div className="trading-post-rules">
                        <span><strong>{number(Number(market.listing_fee_rate || 0.02) * 100)}%</strong> listing fee</span>
                        <span><strong>{number(Number(market.sale_tax_rate || 0.05) * 100)}%</strong> sale tax</span>
                        <span><strong>{number(Math.round(Number(market.listing_seconds || 172800) / 3600))}h</strong> duration</span>
                        <span><strong>{number(market.active_count || 0)} / {number(market.active_limit || 24)}</strong> active listings</span>
                      </div>
                    </div>
                  </div>

                  {market.combat_locked ? <div className="moogle-combat-lock">Trading Post mutations are locked while this adventurer is committed to an active encounter or raid.</div> : null}

                  <div className="trading-post-view-tabs" role="tablist" aria-label="Trading Post view" onKeyDown={(event) => handleTabListKeyDown(event, setMarketView)}>
                    <button type="button" role="tab" data-tab-value="browse" tabIndex={marketView === "browse" ? 0 : -1} aria-selected={marketView === "browse"} className={marketView === "browse" ? "active" : ""} onClick={() => setMarketView("browse")}>Browse Market</button>
                    <button type="button" role="tab" data-tab-value="sell" tabIndex={marketView === "sell" ? 0 : -1} aria-selected={marketView === "sell"} className={marketView === "sell" ? "active" : ""} onClick={() => setMarketView("sell")}>My Listings &amp; Sell</button>
                  </div>

                  {marketView === "browse" ? (
                    <>
                      <div className="trading-post-filters" role="group" aria-label="Trading Post category filter">
                        {[["all", "All"], ["weapons", "Weapons"], ["armor", "Armor"], ["items", "Items"]].map(([value, label]) => (
                          <button key={value} type="button" className={marketCategory === value ? "active" : ""} onClick={() => setMarketCategory(value)}>{label}</button>
                        ))}
                      </div>
                      {marketListings.length ? (
                        <div className="trading-post-listing-grid">
                          {marketListings.map((listing) => {
                            const affordable = Number(market.gil || shop?.gil || 0) >= Number(listing.total_price || 0);
                            const remaining = Math.max(0, Math.ceil(Number(listing.expires_at || 0) - (clock / 1000)));
                            const busy = busyKey === `market-buy:${listing.id}`;
                            return (
                              <article className={`trading-post-listing ${listing.mine ? "mine" : ""}`} key={listing.id}>
                                <div className="trading-post-listing-head">
                                  <ItemArtwork item={listing.item} className="moogle-item-artwork" />
                                  <div><span className="slot-label">{typeLabel(listing.item?.type)}</span><strong className={`item-name rarity-${listing.item?.rarity || "common"}`}>{listing.item?.name || "Unknown Item"}</strong><small>{listing.mine ? "Your listing" : `Seller: ${listing.seller_name || listing.seller_username || "Adventurer"}`}</small></div>
                                </div>
                                <div className="trading-post-price-line"><strong>{number(listing.unit_price)}g</strong><span>each · Qty {number(listing.quantity)}</span></div>
                                <div className="trading-post-total"><span>Total</span><strong>{number(listing.total_price)} Gil</strong></div>
                                <small>Expires in {remaining > 0 ? duration(remaining) : "moments"}</small>
                                {listing.item?.description ? <p>{listing.item.description}</p> : null}
                                {Object.keys(itemBonuses(listing.item)).length ? <small>{formatBonuses(itemBonuses(listing.item))}</small> : null}
                                <button type="button" className="equipment-action-button" disabled={listing.mine || market.combat_locked || !affordable || Boolean(busyKey)} onClick={() => buyMarketListing(listing)}>{busy ? "Buying…" : listing.mine ? "Your Listing" : affordable ? `Buy · ${number(listing.total_price)}g` : `Need ${number(listing.total_price)}g`}</button>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="trading-post-empty"><img src="/trading-post/a1/no-results.png" alt="Moogle checking an empty Trading Post board" /><div><strong>No listings found.</strong><span>Try another category, or be the first adventurer to post something for sale.</span></div></div>
                      )}
                    </>
                  ) : (
                    <div className="trading-post-seller-view">
                      <section className="trading-post-sell-section">
                        <div className="panel-title-row"><div><span className="panel-kicker">Create Listing</span><h3>Sell to other adventurers</h3></div><span className="small-badge">{number(market.active_count || 0)} / {number(market.active_limit || 24)} Active</span></div>
                        {marketEligibleItems.length ? <div className="trading-post-sell-grid">
                          {marketEligibleItems.map((item) => {
                            const max = Math.max(1, Number(item.max_quantity || 1));
                            const quantity = clampQuantity(marketQty[item.id] ?? 1, max);
                            const unitPrice = Math.max(1, Number(marketPrice[item.id] ?? item.reference_price ?? 1) || 1);
                            const total = quantity * unitPrice;
                            const fee = Math.max(1, Math.ceil(total * Number(market.listing_fee_rate || 0.02)));
                            const busy = busyKey === `market-list:${item.id}`;
                            return (
                              <article className="trading-post-sell-card" key={item.id}>
                                <div className="trading-post-listing-head"><ItemArtwork item={item} className="moogle-item-artwork" /><div><span className="slot-label">{typeLabel(item.type)}</span><strong className={`item-name rarity-${item.rarity || "common"}`}>{item.name}</strong><small>Owned {number(item.quantity)} · Listable {number(item.max_quantity)}</small></div></div>
                                <div className="trading-post-list-form">
                                  <label><span>Qty</span><input type="number" inputMode="numeric" min="1" max={max} value={marketQty[item.id] ?? 1} onChange={(event) => setMarketQty((current) => ({ ...current, [item.id]: Math.max(1, Math.min(max, Number(event.target.value) || 1)) }))} /></label>
                                  <label><span>Gil each</span><input type="number" inputMode="numeric" min="1" max="1000000" value={marketPrice[item.id] ?? item.reference_price ?? 1} onChange={(event) => setMarketPrice((current) => ({ ...current, [item.id]: Math.max(1, Math.min(1000000, Number(event.target.value) || 1)) }))} /></label>
                                </div>
                                <small>Total value {number(total)}g · Listing fee {number(fee)}g</small>
                                <button type="button" className="equipment-action-button secondary" disabled={market.combat_locked || Number(market.gil || 0) < fee || Number(market.active_count || 0) >= Number(market.active_limit || 24) || Boolean(busyKey)} onClick={() => listOnMarket(item)}>{busy ? "Posting…" : `Post Listing · ${number(fee)}g fee`}</button>
                              </article>
                            );
                          })}
                        </div> : <div className="state-message compact-state">No eligible inventory is available to list. Key items, quest items, relics, artifacts, and equipped last copies cannot be traded.</div>}
                      </section>

                      <section className="trading-post-own-section">
                        <div className="panel-title-row"><div><span className="panel-kicker">Ledger</span><h3>Your recent listings</h3></div></div>
                        {ownMarketListings.length ? <div className="trading-post-own-list">
                          {ownMarketListings.map((listing) => (
                            <article key={listing.id} className={`trading-post-own-row status-${listing.status}`}>
                              <ItemArtwork item={listing.item} className="moogle-sell-item-artwork" />
                              <div><strong>{listing.item?.name || "Item"} ×{number(listing.quantity)}</strong><span>{number(listing.unit_price)}g each · {number(listing.total_price)}g total</span><small>{String(listing.status || "active").toUpperCase()}{listing.status === "sold" ? ` · Payout ${number(listing.payout_gil)}g · Tax ${number(listing.tax_gil)}g` : ""}</small></div>
                              {listing.status === "active" ? <button type="button" className="equipment-action-button secondary" disabled={market.combat_locked || Boolean(busyKey)} onClick={() => cancelMarketListing(listing)}>{busyKey === `market-cancel:${listing.id}` ? "Cancelling…" : "Cancel"}</button> : null}
                            </article>
                          ))}
                        </div> : <div className="state-message compact-state">You have not posted any Trading Post listings yet.</div>}
                      </section>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
