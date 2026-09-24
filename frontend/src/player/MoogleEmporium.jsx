import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  submitBuyItem,
  submitSellItem,
  submitShopState,
  submitTradingPostState,
  submitTradingPostList,
  submitTradingPostBuy,
  submitTradingPostCancel,
  submitTradingPostWatch,
  submitTradingPostHistory,
  waitForPortalAction,
} from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, formatBestUse, formatBonuses, formatItemUse, number } from "../utils/formatters.js";
import { handleTabListKeyDown } from "../utils/tabKeyboard.js";
import { loadGuideData, mergeItemListWithCatalog } from "../utils/itemCatalog.js";
import ItemArtwork from "../components/ItemArtwork.jsx";
import { beginQuantityEdit, clampQuantity, finishQuantityEdit, quantityInputValue, updateQuantityInput } from "../utils/quantityInput.js";
import { compareTradingPostItems } from "../utils/tradingPostSort.js";
import ContextHelp from "../components/ContextHelp.jsx";
import { recentPricePosition, marketDate } from "../utils/tradingPostInsights.js";


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
  const [marketItemFilter, setMarketItemFilter] = useState("");
  const [marketQty, setMarketQty] = useState({});
  const [marketPrice, setMarketPrice] = useState({});
  const [watchSearch, setWatchSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [history, setHistory] = useState(null);
  const [historyItem, setHistoryItem] = useState("");
  const [relistTarget, setRelistTarget] = useState("");
  const [shopLoadError, setShopLoadError] = useState("");
  const [marketLoadError, setMarketLoadError] = useState("");
  // React Strict Mode and quick tab switching can otherwise queue duplicate
  // authoritative SHOP_STATE requests before the first response arrives.
  const shopRequest = useRef(null);
  const marketRequest = useRef(null);

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
    .filter((listing) => (marketCategory === "all" || shopCategory(listing?.item) === marketCategory)
      && (!marketItemFilter || listing?.item?.id === marketItemFilter))
    .slice().sort(compareTradingPostItems), [market?.listings, marketCategory, marketItemFilter]);
  const marketEligibleItems = useMemo(() => (Array.isArray(market?.eligible_items) ? market.eligible_items : [])
    .slice().sort(compareTradingPostItems), [market?.eligible_items]);
  const ownMarketListings = useMemo(() => (Array.isArray(market?.my_listings) ? market.my_listings : [])
    .slice().sort(compareTradingPostItems), [market?.my_listings]);
  const watchedIds = useMemo(() => new Set(market?.watchlist || []), [market?.watchlist]);
  const marketCatalog = useMemo(() => Array.isArray(market?.catalog_items) ? market.catalog_items : [], [market?.catalog_items]);
  const watchedItems = useMemo(() => (market?.watchlist || [])
    .map((id) => marketCatalog.find((item) => item.id === id))
    .filter(Boolean), [market?.watchlist, marketCatalog]);
  const watchCandidates = useMemo(() => {
    const query = watchSearch.trim().toLowerCase();
    if (query.length < 2) return [];
    return marketCatalog.filter((item) => !watchedIds.has(item.id)
      && (item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query))).slice(0, 12);
  }, [watchSearch, marketCatalog, watchedIds]);
  const historyCandidates = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    if (query.length < 2) return [];
    return marketCatalog.filter((item) => item.name.toLowerCase().includes(query)
      || item.id.toLowerCase().includes(query)).slice(0, 12);
  }, [historySearch, marketCatalog]);

  const annexUnlocked = Boolean(shop?.annex_unlocked);
  const stockSlots = Number(shop?.stock_slots || (annexUnlocked ? 21 : 9));

  // Browsing must not disappear just because an older Bot has not advertised
  // a buy/sell permission. Keep read and mutation permissions independent.
  const shopStateAvailable = Boolean(
    isOwnProfile && auth.actions_enabled && capabilities.has("SHOP_STATE")
  );
  const shopActionsAvailable = Boolean(
    shopStateAvailable && capabilities.has("BUY_ITEM") && capabilities.has("SELL_ITEM")
  );
  const tradingPostActionsAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && capabilities.has("TRADING_POST_STATE")
    && capabilities.has("TRADING_POST_LIST")
    && capabilities.has("TRADING_POST_BUY")
    && capabilities.has("TRADING_POST_CANCEL")
    && capabilities.has("TRADING_POST_WATCH")
    && capabilities.has("TRADING_POST_HISTORY")
  );
  const csrfToken = auth.csrf_token || "";

  useEffect(() => {
    let cancelled = false;
    loadGuideData()
      .then((catalog) => { if (!cancelled) setGuideData(catalog); })
      .catch(() => { if (!cancelled) setGuideData(null); });
    return () => { cancelled = true; };
  }, []);

  const loadShop = useCallback(({ quiet = false } = {}) => {
    if (!shopStateAvailable) return Promise.resolve(null);
    if (shopRequest.current) return shopRequest.current;
    const task = (async () => {
      if (!quiet) {
        setBusyKey("shop-state");
        setMessage("Asking the Moogle for your current stock…");
      }
      setShopLoadError("");
      try {
        const response = await submitShopState(csrfToken, actionKey("shop-state"));
        const finished = await finishedAction(response);
        if (!finished) {
          setShopLoadError("The Guild did not respond in time. Check the Bot connection and retry.");
          return null;
        }
        if (finished.status !== "completed" || finished.result?.ok === false) {
          setShopLoadError(finished.result?.message || "The Moogle could not fetch stock. Retry when the Bot is connected.");
          return null;
        }
        const next = finished.result?.data || null;
        if (!next || !Array.isArray(next.stock)) {
          setShopLoadError("The Bot returned an incomplete shop response. Retry after the Bot reconnects.");
          return null;
        }
        setShop(next);
        // Fresh recruits and low-level characters can have no weapon stock.
        // Open the first populated category instead of showing an empty page.
        setCategory((previous) => next.stock.some((item) => shopCategory(item) === previous)
          ? previous : (["items", "armor", "weapons"].find((kind) => next.stock.some((item) => shopCategory(item) === kind)) || previous));
        if (!quiet) setMessage("Moogle Emporium updated.");
        return next;
      } catch (error) {
        setShopLoadError(error?.message || "The Emporium could not be reached.");
        return null;
      } finally {
        if (!quiet) setBusyKey("");
      }
    })();
    const pending = task.finally(() => { if (shopRequest.current === pending) shopRequest.current = null; });
    shopRequest.current = pending;
    return pending;
  }, [shopStateAvailable, csrfToken]);

  const loadMarket = useCallback(({ quiet = false } = {}) => {
    if (!tradingPostActionsAvailable) return Promise.resolve(null);
    if (marketRequest.current) return marketRequest.current;
    const task = (async () => {
      if (!quiet) {
        setBusyKey("market-state");
        setMessage("Checking the Trading Post ledger…");
      }
      setMarketLoadError("");
      try {
        const response = await submitTradingPostState(csrfToken, actionKey("market-state", "trading-post"));
        const finished = await finishedAction(response);
        if (!finished) {
          setMarketLoadError("The Trading Post did not respond in time. Check the Bot connection and retry.");
          return null;
        }
        if (finished.status !== "completed" || finished.result?.ok === false) {
          setMarketLoadError(finished.result?.message || "The Trading Post could not be loaded.");
          return null;
        }
        const next = finished.result?.data || null;
        if (!next || !Array.isArray(next.listings) || !Array.isArray(next.my_listings)) {
          setMarketLoadError("The Trading Post returned an incomplete response. Please retry.");
          return null;
        }
        setMarket(next);
        if (!quiet) setMessage(next.unlocked ? "Moogle Trading Post updated." : "The Fellowship has not built the Trading Post yet.");
        return next;
      } catch (error) {
        setMarketLoadError(error?.message || "The Trading Post could not be reached.");
        return null;
      } finally {
        if (!quiet) setBusyKey("");
      }
    })();
    const pending = task.finally(() => { if (marketRequest.current === pending) marketRequest.current = null; });
    marketRequest.current = pending;
    return pending;
  }, [tradingPostActionsAvailable, csrfToken]);

  useEffect(() => {
    if (!shopStateAvailable) return;
    loadShop();
  }, [shopStateAvailable, loadShop]);

  useEffect(() => {
    if (mode !== "market" || !tradingPostActionsAvailable) return;
    loadMarket();
  }, [mode, tradingPostActionsAvailable, loadMarket]);

  useEffect(() => {
    const deadline = Number(shop?.expires_at || 0) * 1000;
    if (!deadline) return undefined;
    setClock(Date.now());
    if (deadline <= Date.now()) return undefined;
    // A seconds-accurate rotation timer caused the entire shop/market tree
    // (including all cards and image nodes) to rerender every second.
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setClock(Date.now());
    }, 30000);
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

  const runMarketMutation = async (key, submit, successFallback, { refreshShop = true } = {}) => {
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
        await Promise.all([loadMarket({ quiet: true }), ...(refreshShop ? [loadShop({ quiet: true })] : [])]);
        if (refreshShop) {
          onRefresh?.();
          window.setTimeout(() => onRefresh?.(), 3200);
        }
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

  const toggleWatch = (itemId) => {
    const currentlyWatched = watchedIds.has(itemId);
    return runMarketMutation(
      `market-watch:${itemId}`,
      () => submitTradingPostWatch(itemId, !currentlyWatched, csrfToken, actionKey("market-watch", itemId)),
      currentlyWatched ? "Removed from watchlist." : "Added to watchlist.",
      { refreshShop: false },
    );
  };

  const loadItemHistory = async (itemId) => {
    if (!tradingPostActionsAvailable || busyKey) return;
    setHistoryItem(itemId);
    setHistory(null);
    setHistorySearch("");
    setMarketView("history");
    setBusyKey(`history:${itemId}`);
    try {
      const response = await submitTradingPostHistory(itemId, csrfToken, actionKey("market-history", itemId));
      const finished = await finishedAction(response);
      if (finished?.status === "completed" && finished.result?.ok !== false) {
        setHistory(finished.result?.data || null);
        setMessage("");
      } else {
        setMessage(finished?.result?.message || "Price history is not yet available. Please try again.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey("");
    }
  };

  // This explicitly lists from current inventory through the existing atomic
  // listing endpoint. Past inventory is never silently recreated.
  const quickRelist = (listing) => runMarketMutation(
    `market-relist:${listing.id}`,
    () => submitTradingPostList(listing.item.id, listing.quantity, listing.unit_price,
      csrfToken, actionKey("market-relist", listing.id)),
    "The item has been relisted using its former price and quantity.",
  );

  const editAndRelist = (listing) => {
    const itemId = listing.item.id;
    const eligible = marketEligibleItems.find((item) => item.id === itemId);
    setMarketQty((current) => ({ ...current,
      [itemId]: Math.min(Number(eligible?.max_quantity || 1), Number(listing.quantity || 1)),
    }));
    setMarketPrice((current) => ({ ...current, [itemId]: Number(listing.unit_price || 1) }));
    setRelistTarget(itemId);
    setMarketView("sell");
    setMessage(`Relist draft prepared for ${listing.item.name}. Review the quantity and price before posting.`);
  };

  useEffect(() => {
    if (marketView !== "sell" || !relistTarget) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(`market-sell-${relistTarget}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      setRelistTarget("");
    }, 50);
    return () => window.clearTimeout(timer);
  }, [marketView, relistTarget]);

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

      <div className={`equipment-action-status ${shopStateAvailable ? "ready" : "offline"}`}>
        <strong>{shopStateAvailable ? "The counter is open" : "The counter is closed for now"}</strong>
        <span>{shopStateAvailable
          ? "Looking for supplies? Browse the Emporium, sell a few spare items, or see what other adventurers have posted at the Trading Post. We’ll confirm the price before you buy."
          : "The moogles are taking a short break while the Guild reconnects. Your Gil and items are safe."}</span>
        {message && !shopLoadError && !marketLoadError ? <small aria-live="polite">{message}</small> : null}
        {shopLoadError ? <div className="moogle-load-error" role="alert"><span>{shopLoadError}</span><button type="button" className="equipment-action-button secondary" disabled={Boolean(busyKey)} onClick={() => loadShop()}>Retry Emporium</button></div> : null}
        {marketLoadError && mode === "market" ? <div className="moogle-load-error" role="alert"><span>{marketLoadError}</span><button type="button" className="equipment-action-button secondary" disabled={Boolean(busyKey)} onClick={() => loadMarket()}>Retry Trading Post</button></div> : null}
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
            ? "Fixed Annex stock bonus: +2 Weapons · +4 Armor & Accessories · +6 Items."
            : "Construct the Annex to add +2 Weapons, +4 Armor & Accessories, and +6 Items to each rotation."}</small>
        </div>
      ) : null}

      {!shop && shopStateAvailable && !shopLoadError ? <div className="state-message compact-state" role="status">{busyKey === "shop-state" ? "Loading your current Moogle rotation…" : "Preparing the counter…"}</div> : null}
      {!shop && !shopStateAvailable ? <div className="state-message compact-state">Current stock becomes available when the Bot action service reconnects. Check your sign-in and Bot connection, then reopen this tab.</div> : null}
      {shop && !shopActionsAvailable ? <div className="state-message compact-state">Browsing is available; buying and selling will resume when both transaction permissions are connected.</div> : null}

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
                !marketLoadError ? <div className="state-message compact-state" role="status">Loading the Fellowship Trading Post…</div> : null
              ) : !market.unlocked ? (
                <div className="trading-post-locked">
                  <img src="/trading-post/a1/locked.webp" alt="Locked Moogle Trading Post storefront" />
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
                    <img src="/trading-post/a1/marketplace.webp" alt="Moogle Trading Post marketplace" />
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
                    <button type="button" role="tab" data-tab-value="watchlist" tabIndex={marketView === "watchlist" ? 0 : -1} aria-selected={marketView === "watchlist"} className={marketView === "watchlist" ? "active" : ""} onClick={() => setMarketView("watchlist")}>Watchlist ({watchedIds.size})</button>
                    <button type="button" role="tab" data-tab-value="history" tabIndex={marketView === "history" ? 0 : -1} aria-selected={marketView === "history"} className={marketView === "history" ? "active" : ""} onClick={() => setMarketView("history")}>Recently Sold</button>
                    <button type="button" role="tab" data-tab-value="sell" tabIndex={marketView === "sell" ? 0 : -1} aria-selected={marketView === "sell"} className={marketView === "sell" ? "active" : ""} onClick={() => setMarketView("sell")}>My Listings &amp; Sell</button>
                  </div>

                  {marketView === "browse" ? (
                    <>
                      <div className="trading-post-filters" role="group" aria-label="Trading Post category filter">
                        {[["all", "All"], ["weapons", "Weapons"], ["armor", "Armor"], ["items", "Items"]].map(([value, label]) => (
                          <button key={value} type="button" className={marketCategory === value ? "active" : ""} onClick={() => { setMarketItemFilter(""); setMarketCategory(value); }}>{label}</button>
                        ))}
                      </div>
                      {marketItemFilter ? <div className="trading-post-item-focus">Showing {marketCatalog.find((item) => item.id === marketItemFilter)?.name || marketItemFilter} <button type="button" className="market-history-button" onClick={() => setMarketItemFilter("")}>Show all items</button></div> : null}
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
                                  <div><span className="slot-label">{typeLabel(listing.item?.type)}</span><strong className={`item-name rarity-${listing.item?.rarity || "common"}`}>{listing.item?.name || "Unknown Item"}</strong><small>{listing.mine ? "Your listing" : `Seller: ${listing.seller_name || listing.seller_username || "Adventurer"}`}</small><small>In your bag: {number(market.owned_quantities?.[listing.item?.id] || 0)}</small></div>
                                </div>
                                <div className="trading-post-market-metrics">
                                  <span><strong>{number(listing.unit_price)}g</strong><small>each · Qty {number(listing.quantity)}</small></span>
                                  <span><small>Total</small><strong>{number(listing.total_price)}g</strong></span>
                                  <small className="trading-post-expiry">Expires in {remaining > 0 ? duration(remaining) : "moments"}</small>
                                </div>
                                <div className="trading-post-insight">
                                  {(() => { const insight = recentPricePosition(listing.unit_price, market.price_stats?.[listing.item?.id]);
                                    return insight ? <small className={`market-price-indicator ${insight.tone}`} title="Based on completed sales, weighted by quantity, over the last 30 days. Not a recommended price.">{insight.label} · {number(market.price_stats[listing.item.id].average_price)}g avg ({number(market.price_stats[listing.item.id].sale_count)} sales)</small>
                                      : <small className="market-price-indicator no-history">Fewer than 3 recent sales</small>; })()}
                                  <div className="trading-post-inline-actions">
                                    <button type="button" className={`market-watch-button ${watchedIds.has(listing.item.id) ? "watched" : ""}`} aria-pressed={watchedIds.has(listing.item.id)} disabled={Boolean(busyKey) || (!watchedIds.has(listing.item.id) && watchedIds.size >= Number(market.watch_limit || 30))} onClick={() => toggleWatch(listing.item.id)}>{watchedIds.has(listing.item.id) ? "★ Watching" : "☆ Watch"}</button>
                                    <button type="button" className="market-history-button" disabled={Boolean(busyKey)} onClick={() => loadItemHistory(listing.item.id)}>Price history</button>
                                  </div>
                                </div>
                                {listing.item?.description ? <p className="trading-post-description">{listing.item.description}</p> : null}
                                {Object.keys(itemBonuses(listing.item)).length ? <small>{formatBonuses(itemBonuses(listing.item))}</small> : null}
                                <button type="button" className="equipment-action-button" disabled={listing.mine || market.combat_locked || !affordable || Boolean(busyKey)} onClick={() => buyMarketListing(listing)}>{busy ? "Buying…" : listing.mine ? "Your Listing" : affordable ? `Buy · ${number(listing.total_price)}g` : `Need ${number(listing.total_price)}g`}</button>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="trading-post-empty"><img src="/trading-post/a1/no-results.webp" alt="Moogle checking an empty Trading Post board" /><div><strong>No listings found.</strong><span>Try another category, or be the first adventurer to post something for sale.</span></div></div>
                      )}
                    </>
                  ) : marketView === "watchlist" ? (
                    <section className="trading-post-watch-view" aria-label="Trading Post watchlist">
                      <div className="panel-title-row"><div><span className="panel-kicker">Saved to this character</span><h3>Watched items</h3></div><span className="small-badge">{watchedIds.size} / {number(market.watch_limit || 30)}</span></div>
                      <p className="trading-post-small-note">Your watchlist stays across devices. It does not place bids or trigger automatic purchases.</p>
                      <label className="market-catalog-search">Find an item to watch
                        <input type="search" value={watchSearch} onChange={(event) => setWatchSearch(event.target.value)} placeholder="Search eligible gear, materials or supplies…" />
                      </label>
                      {watchCandidates.length ? <div className="market-search-results" role="group" aria-label="Matching items">
                        {watchCandidates.map((item) => <button type="button" key={item.id} disabled={Boolean(busyKey) || watchedIds.size >= Number(market.watch_limit || 30)} onClick={() => { toggleWatch(item.id); setWatchSearch(""); }}>☆ Watch {item.name}</button>)}
                      </div> : null}
                      {watchSearch.trim().length >= 2 && !watchCandidates.length ? <small>No unwatched eligible items match.</small> : null}
                      {watchedItems.length ? <div className="trading-post-watch-grid">
                        {watchedItems.map((item) => {
                          const marketSummary = market.watchlist_market?.[item.id];
                          const recent = market.price_stats?.[item.id];
                          return <article key={item.id} className="trading-post-watch-card">
                            <div className="trading-post-listing-head"><ItemArtwork item={item} className="moogle-item-artwork" /><div><strong>{item.name}</strong><small>Owned {number(market.owned_quantities?.[item.id] || 0)} · {number(marketSummary?.listing_count || 0)} current listings</small></div></div>
                            <div className="market-watch-stat"><span>Lowest current asking price</span><strong>{marketSummary ? `${number(marketSummary.min_asking_price)}g` : "No active listing"}</strong></div>
                            <div className="market-watch-stat"><span>30-day completed-sale average</span><strong>{recent ? `${number(recent.average_price)}g (${number(recent.sale_count)} sales)` : "No recent sales"}</strong></div>
                            <div className="trading-post-inline-actions">
                              <button type="button" className="market-history-button" disabled={Boolean(busyKey)} onClick={() => loadItemHistory(item.id)}>Price history</button>
                              <button type="button" className="market-watch-button watched" disabled={Boolean(busyKey)} onClick={() => toggleWatch(item.id)}>★ Unwatch</button>
                              {marketSummary ? <button type="button" className="market-history-button" onClick={() => { setMarketItemFilter(item.id); setMarketCategory(shopCategory(item)); setMarketView("browse"); }}>View listings</button> : null}
                            </div>
                          </article>;
                        })}
                      </div> : <div className="state-message compact-state">No watched items yet. Search above or watch items directly on the marketplace.</div>}
                    </section>
                  ) : marketView === "history" ? (
                    <section className="trading-post-history-view" aria-label="Recently sold items">
                      <div className="panel-title-row"><div><span className="panel-kicker">Actual sales, not asking prices</span><h3>Recently sold</h3></div><span className="small-badge">Last {number(market.history_days || 30)} days</span></div>
                      <p className="trading-post-small-note">Prices reflect player-to-player transactions. Average prices are weighted by quantity. A few trades may not reflect typical prices.</p>
                      <label className="market-catalog-search">Look up an item’s last 12 sales
                        <input type="search" value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} placeholder="Find an item for detailed history…" />
                      </label>
                      {historyCandidates.length ? <div className="market-search-results" role="group" aria-label="History search matches">
                        {historyCandidates.map((item) => <button type="button" key={item.id} disabled={Boolean(busyKey)} onClick={() => loadItemHistory(item.id)}>{item.name}</button>)}
                      </div> : null}
                      {historyItem ? <div className="trading-post-history-detail">
                        <h4>{history?.item_name || marketCatalog.find((item) => item.id === historyItem)?.name || historyItem}</h4>
                        {history ? (history.sales?.length ? <div className="market-recent-sale-list">{history.sales.map((sale, index) => <div className="market-sale-row" key={`${sale.sold_at}-${index}`}><strong>{number(sale.unit_price)}g each</strong><span>×{number(sale.quantity)}</span><time dateTime={new Date(sale.sold_at * 1000).toISOString()}>{marketDate(sale.sold_at)}</time></div>)}</div> : <p>No completed sales for this item in the past 30 days.</p>) : <p>{busyKey.startsWith("history:") ? "Loading item history…" : "Select an item to load its history."}</p>}
                      </div> : null}
                      <h4 className="market-recent-title">Latest completed sales across the Trading Post</h4>
                      {(market.recent_sales || []).length ? <div className="market-recent-sale-list">{market.recent_sales.map((sale,index) => <div className="market-sale-row" key={`${sale.item_id}-${sale.sold_at}-${index}`}><button type="button" className="market-history-button" disabled={Boolean(busyKey)} onClick={() => loadItemHistory(sale.item_id)}>{sale.item_name}</button><strong>{number(sale.unit_price)}g each</strong><span>×{number(sale.quantity)}</span><time dateTime={new Date(sale.sold_at * 1000).toISOString()}>{marketDate(sale.sold_at)}</time></div>)}</div> : <div className="state-message compact-state">No completed Trading Post sales in the last 30 days.</div>}
                    </section>
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
                              <article className="trading-post-sell-card" key={item.id} id={`market-sell-${item.id}`}>
                                <div className="trading-post-listing-head"><ItemArtwork item={item} className="moogle-item-artwork" /><div><span className="slot-label">{typeLabel(item.type)}</span><strong className={`item-name rarity-${item.rarity || "common"}`}>{item.name}</strong><small>Owned {number(item.quantity)} · Listable {number(item.max_quantity)}</small></div></div>
                                <div className="trading-post-list-form">
                                  <label><span>Qty</span><input type="number" inputMode="numeric" min="1" max={max} value={marketQty[item.id] ?? 1} onChange={(event) => setMarketQty((current) => ({ ...current, [item.id]: Math.max(1, Math.min(max, Number(event.target.value) || 1)) }))} /></label>
                                  <label><span>Gil each</span><input type="number" inputMode="numeric" min="1" max="1000000" value={marketPrice[item.id] ?? item.reference_price ?? 1} onChange={(event) => setMarketPrice((current) => ({ ...current, [item.id]: Math.max(1, Math.min(1000000, Number(event.target.value) || 1)) }))} /></label>
                                </div>
                                <small className="trading-post-fee-summary">{market.price_stats?.[item.id] ? `30-day sold avg: ${number(market.price_stats[item.id].average_price)}g across ${number(market.price_stats[item.id].sale_count)} sales · ` : "No recent sold-price history · "}Total {number(total)}g · Fee {number(fee)}g</small>
                                <button type="button" className="equipment-action-button secondary" disabled={market.combat_locked || Number(market.gil || 0) < fee || Number(market.active_count || 0) >= Number(market.active_limit || 24) || Boolean(busyKey)} onClick={() => listOnMarket(item)}>{busy ? "Posting…" : `Post Listing · ${number(fee)}g fee`}</button>
                              </article>
                            );
                          })}
                        </div> : <div className="state-message compact-state">Nothing in your bag can go up for sale right now. Key items, quest items, relics, artifacts, and equipped last copies cannot be traded.</div>}
                      </section>

                      <section className="trading-post-own-section">
                        <div className="panel-title-row"><div><span className="panel-kicker">Ledger</span><h3>Your recent listings</h3></div></div>
                        {ownMarketListings.length ? <div className="trading-post-own-list">
                          {ownMarketListings.map((listing) => (
                            <article key={listing.id} className={`trading-post-own-row status-${listing.status}`}>
                              <ItemArtwork item={listing.item} className="moogle-sell-item-artwork" />
                              <div><strong>{listing.item?.name || "Item"} ×{number(listing.quantity)}</strong><span>{number(listing.unit_price)}g each · {number(listing.total_price)}g total</span><small>{String(listing.status || "active").toUpperCase()}{listing.status === "sold" ? ` · Payout ${number(listing.payout_gil)}g · Tax ${number(listing.tax_gil)}g` : ""}</small></div>
                              {listing.status === "active" ? <button type="button" className="equipment-action-button secondary" disabled={market.combat_locked || Boolean(busyKey)} onClick={() => cancelMarketListing(listing)}>{busyKey === `market-cancel:${listing.id}` ? "Cancelling…" : "Cancel"}</button> : (
                                <div className="market-relist-actions">
                                  {(() => { const inventory = marketEligibleItems.find((item) => item.id === listing.item.id);
                                    const canRelist = Number(inventory?.max_quantity || 0) >= Number(listing.quantity || 0);
                                    const fee = Math.max(1, Math.ceil(Number(listing.total_price || 0) * Number(market.listing_fee_rate || 0.02)));
                                    const canPost = canRelist && Number(market.gil || 0) >= fee && Number(market.active_count || 0) < Number(market.active_limit || 24) && !market.combat_locked && !busyKey;
                                    return <>
                                      <button type="button" className="equipment-action-button secondary" disabled={!canPost} title={!canRelist ? "You need the original quantity back in your unequipped inventory." : `Lists at the same price; charges a new ${number(fee)}g listing fee.`} onClick={() => quickRelist(listing)}>{busyKey === `market-relist:${listing.id}` ? "Relisting…" : canRelist ? `Quick relist · ${number(fee)}g fee` : "Not enough items"}</button>
                                      {inventory ? <button type="button" className="market-history-button" disabled={Boolean(busyKey)} onClick={() => editAndRelist(listing)}>Edit &amp; relist</button> : null}
                                    </>;
                                  })()}
                                </div>
                              )}
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
