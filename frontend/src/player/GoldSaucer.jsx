import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitCactpotLine,
  submitCactpotReveal,
  submitCactpotStart,
  submitGoldSaucerState,
  submitSaucerBuy,
  submitSlotsSpin,
  waitForPortalAction,
} from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number } from "../utils/formatters.js";

const LINE_NAMES = ["Top Row", "Middle Row", "Bottom Row", "Left Column", "Center Column", "Right Column", "Down Diagonal", "Up Diagonal"];
const SLOT_GLYPHS = { crystal: "✦", moogle: "◇", chocobo: "♞", cactuar: "✣", bomb: "●", potion: "◆" };

function actionKey(kind, target = "saucer") {
  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${kind}:${target}:${suffix}`;
}

async function finishedAction(response) {
  const action = response?.action;
  if (!action?.id) throw new Error("Crystal Guild did not return a Gold Saucer request ID.");
  if (action.status === "completed" || action.status === "failed") return action;
  return waitForPortalAction(action.id, { attempts: 32, delayMs: 600 });
}

function Reel({ id, label }) {
  return <div className={`saucer-reel symbol-${id}`}><span aria-hidden="true">{SLOT_GLYPHS[id] || "✧"}</span><small>{label || id || "—"}</small></div>;
}

export default function GoldSaucer({ data, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [clock, setClock] = useState(() => Date.now());

  const username = String(overview?.identity?.username || data?.identity?.username || "").toLowerCase();
  const isOwnProfile = Boolean(auth.authenticated && auth.player?.username && String(auth.player.username).toLowerCase() === username);
  const capabilities = useMemo(() => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []), [auth.action_capabilities]);
  const required = ["GOLD_SAUCER_STATE", "CACTPOT_START", "CACTPOT_REVEAL", "CACTPOT_LINE", "SLOTS_SPIN", "SAUCER_BUY"];
  const actionsAvailable = Boolean(isOwnProfile && auth.actions_enabled && required.every((kind) => capabilities.has(kind)));
  const csrfToken = auth.csrf_token || "";

  const applyFinished = useCallback((finished, fallback) => {
    if (!finished) {
      setMessage("The Gold Saucer request is still being processed. Refresh before trying again.");
      return null;
    }
    setMessage(finished.result?.message || fallback);
    const next = finished.result?.data?.gold_saucer_state || null;
    if (next) {
      setState(next);
      setClock(Date.now());
    }
    return next;
  }, []);

  const loadState = useCallback(async ({ quiet = false } = {}) => {
    if (!actionsAvailable || busy) return null;
    if (!quiet) { setBusy("state"); setMessage("Checking the Gold Saucer floor…"); }
    try {
      const response = await submitGoldSaucerState(csrfToken, actionKey("saucer-state"));
      const finished = await finishedAction(response);
      return applyFinished(finished, "Gold Saucer refreshed.");
    } catch (error) {
      setMessage(String(error?.message || error));
      return null;
    } finally {
      if (!quiet) setBusy("");
    }
  }, [actionsAvailable, busy, csrfToken, applyFinished]);

  useEffect(() => {
    if (!actionsAvailable || state) return;
    void loadState({ quiet: true });
  }, [actionsAvailable, state, loadState]);

  useEffect(() => {
    if (!state) return undefined;
    const tick = () => setClock(Date.now());
    const timer = window.setInterval(tick, 1000);
    const visible = () => { if (document.visibilityState === "visible") tick(); };
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", visible);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", visible); };
  }, [state]);

  const mutate = async (key, submit, fallback) => {
    if (!actionsAvailable || busy) return;
    setBusy(key);
    setMessage(fallback);
    try {
      const response = await submit();
      const finished = await finishedAction(response);
      const next = applyFinished(finished, fallback);
      if (finished?.status === "completed" && finished.result?.ok !== false) {
        onRefresh?.();
        if (!next) await loadState({ quiet: true });
      }
    } catch (error) {
      setMessage(String(error?.message || error));
    } finally {
      setBusy("");
    }
  };

  if (!isOwnProfile) {
    return (
      <section className="panel gold-saucer-panel">
        <p className="eyebrow">v1.6.0 · Gold Saucer Alpha 1</p>
        <h2>Gold Saucer</h2>
        <p className="muted">Gold Saucer play and balances are private to the signed-in adventurer. Open your own profile to enter the floor.</p>
      </section>
    );
  }

  const nowSeconds = Math.floor(clock / 1000);
  const cactpot = state?.cactpot || {};
  const ticket = cactpot.ticket || null;
  const cactpotRemaining = Math.max(0, Number(cactpot.available_at || 0) - nowSeconds);
  const slots = state?.slots || {};
  const slotsRemaining = Math.max(0, Number(slots.available_at || 0) - nowSeconds);
  const points = Number(state?.points || 0);
  const prizes = Array.isArray(state?.prizes) ? state.prizes : [];
  const history = Array.isArray(state?.history) ? state.history : [];
  const nextAllowanceRemaining = Math.max(0, Number(state?.next_daily_allowance_at || 0) - nowSeconds);
  const canStartTicket = Boolean(!ticket?.state || ticket.state === "resolved") && cactpotRemaining <= 0 && points >= Number(cactpot.cost || 10);
  const canSpin = slotsRemaining <= 0 && points >= Number(slots.cost || 15);
  const revealed = new Set(Array.isArray(ticket?.revealed) ? ticket.revealed : []);
  const lastSlots = slots?.last_spin?.details || null;
  const reels = Array.isArray(lastSlots?.reels) ? lastSlots.reels : [];
  const reelLabels = Array.isArray(lastSlots?.labels) ? lastSlots.labels : [];

  return (
    <section className="gold-saucer-shell">
      <section className="panel gold-saucer-hero">
        <div>
          <p className="eyebrow">v1.6.0 · Gold Saucer Alpha 1</p>
          <h2>Gold Saucer</h2>
          <p className="muted">A low-stakes side hall for daily luck, quick games, cosmetic rewards, collection records, and future Chocobo and card attractions. First visit includes a 500 SP welcome purse.</p>
        </div>
        <div className="saucer-balance">
          <span>Current Balance</span>
          <strong>{number(points)} SP</strong>
          <small>Saucer Points cannot be purchased with Gil. After your welcome day, the floor grants {number(state?.daily_allowance_points || 50)} SP once per UTC day so you can always play again.</small>
        </div>
      </section>

      <div className={`equipment-action-status ${actionsAvailable ? "ready" : "offline"}`}>
        <strong>{actionsAvailable ? "Gold Saucer connection ready" : "Gold Saucer controls unavailable"}</strong>
        <span>{actionsAvailable ? "All draws, payouts, cooldowns, and records are resolved by the authoritative Guild Bot." : "Gold Saucer play returns when Crystal Guild reconnects."}</span>
        {message ? <small aria-live="polite">{message}</small> : null}
        <button type="button" className="equipment-action-button secondary" disabled={!actionsAvailable || Boolean(busy)} onClick={() => loadState()}>{busy === "state" ? "Checking…" : "Refresh Floor"}</button>
      </div>

      {!state ? <div className="state-message">{actionsAvailable ? "Opening the Gold Saucer floor…" : "Crystal Guild must be online to enter."}</div> : (
        <>
          <div className="saucer-game-grid">
            <section className="panel saucer-game-card cactpot-card">
              <div className="panel-title-row">
                <div><p className="eyebrow">Daily Attraction</p><h3>Mini Cactpot</h3></div>
                <span className="small-badge">{number(cactpot.cost || 10)} SP</span>
              </div>
              <p className="muted">Open one ticket, reveal three additional cells, then choose a row, column, or diagonal. The three-number sum determines the payout.</p>
              {ticket ? (
                <>
                  <div className="cactpot-grid" aria-label="Mini Cactpot ticket">
                    {(ticket.grid || Array(9).fill(null)).map((value, index) => (
                      <button
                        type="button"
                        key={index}
                        className={`cactpot-cell ${value != null ? "revealed" : "hidden"}`}
                        disabled={!actionsAvailable || Boolean(busy) || ticket.state !== "reveal" || revealed.has(index)}
                        onClick={() => mutate(`reveal-${index}`, () => submitCactpotReveal(index, csrfToken, actionKey("cactpot-reveal", index)), "Revealing Mini Cactpot cell…")}
                        aria-label={value != null ? `Cell ${index + 1}: ${value}` : `Reveal cell ${index + 1}`}
                      >{value != null ? value : "?"}</button>
                    ))}
                  </div>
                  {ticket.state === "reveal" ? <p className="saucer-instruction">Reveal {number(ticket.reveals_remaining)} more cell{Number(ticket.reveals_remaining) === 1 ? "" : "s"}.</p> : null}
                  {ticket.state === "line" ? (
                    <div className="cactpot-lines">
                      <span className="slot-label">Choose one payout line</span>
                      <div className="cactpot-line-buttons">
                        {(cactpot.lines || []).map((line) => <button type="button" className="equipment-action-button secondary" key={line.index} disabled={!actionsAvailable || Boolean(busy)} onClick={() => mutate(`line-${line.index}`, () => submitCactpotLine(line.index, csrfToken, actionKey("cactpot-line", line.index)), "Resolving Mini Cactpot…")}>{LINE_NAMES[line.index] || `Line ${line.index + 1}`}</button>)}
                      </div>
                    </div>
                  ) : null}
                  {ticket.state === "resolved" ? <div className="saucer-result"><strong>{number(ticket.payout)} SP won</strong><span>{LINE_NAMES[ticket.chosen_line] || "Chosen line"}</span></div> : null}
                </>
              ) : null}
              {(!ticket || ticket.state === "resolved") ? (
                <div className="card-actions">
                  <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !canStartTicket} onClick={() => mutate("cactpot-start", () => submitCactpotStart(csrfToken, actionKey("cactpot-start")), "Opening Mini Cactpot ticket…")}>{busy === "cactpot-start" ? "Opening…" : cactpotRemaining > 0 ? `Next Ticket ${duration(cactpotRemaining)}` : points < Number(cactpot.cost || 10) ? "Not Enough SP" : "Open Daily Ticket"}</button>
                </div>
              ) : null}
            </section>

            <section className="panel saucer-game-card slots-card">
              <div className="panel-title-row">
                <div><p className="eyebrow">Quick Attraction</p><h3>Crystal Slots</h3></div>
                <span className="small-badge">{number(slots.cost || 15)} SP / spin</span>
              </div>
              <p className="muted">Three matching symbols pay the most. Any pair pays a small win. Spins are deliberately paced by the server.</p>
              <div className="saucer-reels" aria-label="Last Crystal Slots result">
                {[0, 1, 2].map((index) => <Reel key={index} id={reels[index]} label={reelLabels[index]} />)}
              </div>
              {slots.last_spin ? <div className="saucer-result"><strong>{slots.last_spin.payout > 0 ? `+${number(slots.last_spin.payout)} SP` : "No payout"}</strong><span>{String(slots.last_spin.outcome || "spin").replaceAll("_", " ")}</span></div> : <p className="saucer-instruction">No spins recorded yet.</p>}
              <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !canSpin} onClick={() => mutate("slots", () => submitSlotsSpin(csrfToken, actionKey("slots-spin")), "Spinning Crystal Slots…")}>{busy === "slots" ? "Spinning…" : slotsRemaining > 0 ? `Ready in ${duration(slotsRemaining)}` : points < Number(slots.cost || 15) ? "Not Enough SP" : `Spin · ${number(slots.cost || 15)} SP`}</button>
            </section>
          </div>

          <section className="panel saucer-prize-panel">
            <div className="panel-title-row">
              <div><p className="eyebrow">Cosmetic Rewards</p><h3>Prize Counter</h3></div>
              <span className="small-badge">Titles Only · Alpha 1</span>
            </div>
            <p className="muted">Spend SP on collectible titles. Alpha 1 prizes are cosmetic only and never grant combat stats, Gil, items, or progression advantages.</p>
            <div className="saucer-prize-grid">
              {prizes.map((prize) => (
                <article className={`saucer-prize-card ${prize.owned ? "owned" : ""}`} key={prize.id}>
                  <div>
                    <span className={`small-badge ${prize.owned ? "ready" : ""}`}>{prize.owned ? "OWNED" : `${number(prize.cost)} SP`}</span>
                    <h4>{prize.name}</h4>
                    <p className="muted">{prize.description}</p>
                  </div>
                  <button
                    type="button"
                    className="equipment-action-button secondary"
                    disabled={!actionsAvailable || Boolean(busy) || prize.owned || points < Number(prize.cost || 0)}
                    onClick={() => mutate(`prize-${prize.id}`, () => submitSaucerBuy(prize.id, csrfToken, actionKey("saucer-buy", prize.id)), `Claiming ${prize.name}…`)}
                  >{prize.owned ? "Collected" : points < Number(prize.cost || 0) ? "Not Enough SP" : `Unlock · ${number(prize.cost)} SP`}</button>
                </article>
              ))}
            </div>
            <p className="saucer-instruction">Next daily floor allowance in {duration(nextAllowanceRemaining)}. Your first-day welcome purse replaces the allowance for that day.</p>
          </section>

          <section className="panel saucer-records-panel">
            <div className="panel-title-row"><div><p className="eyebrow">Personal Records</p><h3>Saucer Ledger</h3></div><span className="small-badge">Alpha 1</span></div>
            <div className="saucer-record-grid">
              <div><span>Lifetime Earned</span><strong>{number(state.account?.lifetime_earned)} SP</strong></div>
              <div><span>Lifetime Spent</span><strong>{number(state.account?.lifetime_spent)} SP</strong></div>
              <div><span>Prizes Collected</span><strong>{number(state.account?.prizes_bought)}</strong></div>
              <div><span>Cactpot Tickets</span><strong>{number(state.account?.cactpot_plays)}</strong></div>
              <div><span>Best Cactpot</span><strong>{number(state.account?.cactpot_best_payout)} SP</strong></div>
              <div><span>Slot Spins</span><strong>{number(state.account?.slots_spins)}</strong></div>
              <div><span>Best Slots</span><strong>{number(state.account?.slots_best_payout)} SP</strong></div>
            </div>
          </section>

          <section className="panel saucer-history-panel">
            <div className="panel-title-row"><div><p className="eyebrow">Recent Activity</p><h3>Last Eight Entries</h3></div></div>
            {history.length ? (
              <div className="saucer-history-list">
                {history.map((entry, index) => {
                  const game = String(entry.game || "activity").replaceAll("_", " ");
                  const details = entry.details || {};
                  const label = entry.game === "prize" ? String(details.name || entry.outcome || "Prize") : entry.game === "daily_allowance" ? "Daily floor allowance" : entry.game === "welcome" ? "Welcome purse" : game;
                  return <div className="saucer-history-row" key={`${entry.created_at || 0}-${index}`}>
                    <span><strong>{label}</strong><small>{entry.game === "slots" && Array.isArray(details.labels) ? details.labels.join(" · ") : String(entry.outcome || "").replaceAll("_", " ")}</small></span>
                    <b className={Number(entry.payout || 0) > Number(entry.wager || 0) ? "positive" : ""}>{Number(entry.payout || 0) > 0 ? `+${number(entry.payout)} SP` : Number(entry.wager || 0) > 0 ? `−${number(entry.wager)} SP` : "—"}</b>
                  </div>;
                })}
              </div>
            ) : <p className="muted">No Gold Saucer activity recorded yet.</p>}
          </section>

          <section className="panel saucer-attractions-panel">
            <div className="panel-title-row"><div><p className="eyebrow">Gold Saucer Roadmap</p><h3>Attractions</h3></div></div>
            <div className="saucer-attraction-grid">
              {(state.attractions || []).map((attraction) => (
                <article className={`saucer-attraction ${attraction.status}`} key={attraction.id}>
                  <span className={`small-badge ${attraction.status === "open" ? "ready" : "locked"}`}>{attraction.status === "open" ? "OPEN" : "COMING SOON"}</span>
                  <h4>{attraction.name}</h4>
                  <p className="muted">{attraction.description}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
