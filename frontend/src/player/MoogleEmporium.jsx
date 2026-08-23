import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitBuyItem,
  submitSellItem,
  submitShopState,
  waitForPortalAction,
} from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number } from "../utils/formatters.js";

function actionKey(kind, target = "shop") {
  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${kind}:${target}:${suffix}`;
}

function clampQuantity(value, max = 99) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(max, parsed));
}

function typeLabel(type) {
  const value = String(type || "item").toLowerCase();
  if (value === "consumable") return "Supply";
  return value.replace(/^./, (letter) => letter.toUpperCase());
}

function shopLevel(item) {
  const value = Number(item?.min_level ?? item?.level ?? item?.shop_level);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function compareShopItems(left, right) {
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

  const shopActionsAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && capabilities.has("SHOP_STATE")
    && capabilities.has("BUY_ITEM")
    && capabilities.has("SELL_ITEM")
  );
  const csrfToken = auth.csrf_token || "";

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
    const quantity = item.equipment ? 1 : clampQuantity(buyQty[item.id] || 1, max);
    return runMutation(
      `buy:${item.id}`,
      () => submitBuyItem(item.id, quantity, csrfToken, actionKey("buy", item.id)),
      "Purchase complete.",
    );
  };

  const sell = (item) => {
    const max = Math.max(1, Number(item.max_sell_quantity || 1));
    const quantity = clampQuantity(sellQty[item.id] || 1, max);
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
        <div className="moogle-wallet" aria-label={`${number(shop?.gil ?? overview?.identity?.gil ?? 0)} Gil`}>
          <strong>{number(shop?.gil ?? overview?.identity?.gil ?? 0)}</strong><span>Gil</span>
        </div>
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

      {!shop && shopActionsAvailable ? <div className="state-message compact-state">Loading your current Moogle rotation…</div> : null}
      {!shop && !shopActionsAvailable ? <div className="state-message compact-state">Current stock becomes available when Crystal Guild reconnects.</div> : null}

      {shop ? (
        <>
          {shop.combat_locked ? (
            <div className="moogle-combat-lock">Transactions are locked while this adventurer is committed to an active encounter or raid.</div>
          ) : null}
          <div className="moogle-stock-grid">
            {[...(shop.stock || [])].sort(compareShopItems).map((item) => {
              const max = item.equipment ? 1 : 99;
              const quantity = item.equipment ? 1 : clampQuantity(buyQty[item.id] || 1, max);
              const total = Number(item.price || 0) * quantity;
              const affordable = Number(shop.gil || 0) >= total;
              const busy = busyKey === `buy:${item.id}`;
              return (
                <article className="moogle-item-card" key={item.id}>
                  <div className="moogle-item-head">
                    <span className="slot-label">{typeLabel(item.type)}</span>
                    <span className={`item-name rarity-${item.rarity || "common"}`}>{item.name}</span>
                  </div>
                  <div className="moogle-item-price"><strong>{number(item.price)}</strong><span>Gil</span></div>
                  <div className="card-meta">Owned {number(item.owned)} · {String(item.rarity || "common").replace(/^./, (c) => c.toUpperCase())}</div>
                  {item.description ? <p className="moogle-item-description">{item.description}</p> : null}
                  {Array.isArray(item.allowed_jobs) && item.allowed_jobs.length ? (
                    <div className="moogle-requirement">Jobs: {item.allowed_jobs.join(", ")}</div>
                  ) : null}
                  {Number(item.min_level || 1) > 1 ? <div className="moogle-requirement">Requires Lv.{number(item.min_level)}</div> : null}
                  <div className="moogle-card-actions">
                    {!item.equipment ? (
                      <label className="moogle-quantity"><span>Qty</span><input type="number" min="1" max="99" value={quantity} onChange={(event) => setBuyQty((current) => ({ ...current, [item.id]: clampQuantity(event.target.value, 99) }))} /></label>
                    ) : <span className="moogle-fixed-quantity">Qty 1</span>}
                    <button
                      type="button"
                      className="equipment-action-button"
                      disabled={!shopActionsAvailable || shop.combat_locked || !affordable || Boolean(busyKey)}
                      onClick={() => buy(item)}
                    >
                      {busy ? "Buying…" : (affordable ? `Buy ${item.name} · ${number(total)}g` : `Need ${number(total)}g`)}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <details className="moogle-sell-disclosure">
            <summary>
              <span><strong>Sell from Inventory</strong><small>Optional · {sellableItems.length} sellable stacks</small></span>
              <span aria-hidden="true">⌄</span>
            </summary>
            <div className="moogle-sell-body">
              {!sellableItems.length ? <div className="muted">Nothing in this inventory can currently be sold.</div> : (
                <div className="moogle-sell-grid">
                  {sellableItems.map((item) => {
                    const max = Number(item.max_sell_quantity || 0);
                    const quantity = clampQuantity(sellQty[item.id] || 1, Math.max(1, max));
                    const proceeds = Number(item.sell_price || 0) * quantity;
                    const busy = busyKey === `sell:${item.id}`;
                    return (
                      <article className="moogle-sell-row" key={item.id}>
                        <div className="moogle-sell-copy">
                          <span className={`item-name rarity-${item.rarity || "common"}`}>{item.name}</span>
                          <span>Owned {number(item.quantity)} · {number(item.sell_price)}g each{item.equipped ? " · Equipped" : ""}</span>
                          {max <= 0 ? <small>Unequip this item before selling your last copy.</small> : null}
                        </div>
                        <div className="moogle-card-actions sell-actions">
                          <label className="moogle-quantity"><span>Qty</span><input type="number" min="1" max={Math.max(1, max)} value={quantity} disabled={max <= 0} onChange={(event) => setSellQty((current) => ({ ...current, [item.id]: clampQuantity(event.target.value, Math.max(1, max)) }))} /></label>
                          <button
                            type="button"
                            className="equipment-action-button secondary"
                            disabled={!shopActionsAvailable || shop.combat_locked || max <= 0 || Boolean(busyKey)}
                            onClick={() => sell(item)}
                          >
                            {busy ? "Selling…" : `Sell ${item.name} · ${number(proceeds)}g`}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </details>
        </>
      ) : null}
    </section>
  );
}
