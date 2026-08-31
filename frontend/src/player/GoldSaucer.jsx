import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitCactpotLine,
  submitCactpotReveal,
  submitCactpotStart,
  submitGoldSaucerState,
  submitMonsterTossStart,
  submitMonsterTossThrow,
  submitSaucerBuy,
  submitSlotsSpin,
  waitForPortalAction,
} from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number } from "../utils/formatters.js";

const LINE_NAMES = ["Top Row", "Middle Row", "Bottom Row", "Left Column", "Center Column", "Right Column", "Down Diagonal", "Up Diagonal"];
const SAUCER_ART_ROOT = "/gold-saucer/a1h1";
const SLOT_IDS = ["crystal", "moogle", "chocobo", "cactuar", "bomb", "potion"];
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const SLOT_ART = {
  crystal: `${SAUCER_ART_ROOT}/slots/crystal.webp`,
  moogle: `${SAUCER_ART_ROOT}/slots/moogle.webp`,
  chocobo: `${SAUCER_ART_ROOT}/slots/chocobo.webp`,
  cactuar: `${SAUCER_ART_ROOT}/slots/cactuar.webp`,
  bomb: `${SAUCER_ART_ROOT}/slots/bomb.webp`,
  potion: `${SAUCER_ART_ROOT}/slots/potion.webp`,
};

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
  const art = SLOT_ART[id] || null;
  return (
    <div className={`saucer-reel symbol-${id || "empty"}`}>
      {art ? <img className="saucer-slot-symbol" src={art} alt="" aria-hidden="true" /> : <span className="saucer-slot-placeholder" aria-hidden="true">✧</span>}
      <small>{label || id || "—"}</small>
    </div>
  );
}

export default function GoldSaucer({ data, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const [slotDisplay, setSlotDisplay] = useState({ reels: [], labels: [] });
  const [slotAnimating, setSlotAnimating] = useState(false);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [tossTarget, setTossTarget] = useState("medium_pot");
  const [tossStyle, setTossStyle] = useState("normal");

  const username = String(overview?.identity?.username || data?.identity?.username || "").toLowerCase();
  const isOwnProfile = Boolean(auth.authenticated && auth.player?.username && String(auth.player.username).toLowerCase() === username);
  const capabilities = useMemo(() => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []), [auth.action_capabilities]);
  const required = ["GOLD_SAUCER_STATE", "CACTPOT_START", "CACTPOT_REVEAL", "CACTPOT_LINE", "SLOTS_SPIN", "MONSTER_TOSS_START", "MONSTER_TOSS_THROW", "SAUCER_BUY"];
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

  const spinSlots = async () => {
    if (!actionsAvailable || busy) return;
    setBusy("slots");
    setSlotAnimating(true);
    setMessage("Spinning Crystal Slots…");
    try {
      const response = await submitSlotsSpin(csrfToken, actionKey("slots-spin"));
      const finished = await finishedAction(response);
      if (!finished) throw new Error("Crystal Slots result is still processing.");
      if (finished.result?.ok === false) {
        applyFinished(finished, "Crystal Slots could not spin.");
        return;
      }
      const finalReels = Array.isArray(finished.result?.data?.reels) ? finished.result.data.reels : [];
      const finalState = finished.result?.data?.gold_saucer_state || null;
      const finalDetails = finalState?.slots?.last_spin?.details || {};
      const finalLabels = Array.isArray(finalDetails.labels) ? finalDetails.labels : finalReels.map((value) => String(value || "").replaceAll("_", " "));
      for (let frame = 0; frame < 9; frame += 1) {
        const ids = [0, 1, 2].map((reel) => SLOT_IDS[(frame * 2 + reel * 3) % SLOT_IDS.length]);
        setSlotDisplay({ reels: ids, labels: ids.map((value) => value.replaceAll("_", " ")) });
        await wait(70 + frame * 8);
      }
      for (let stop = 0; stop < 3; stop += 1) {
        setSlotDisplay((current) => {
          const ids = [...current.reels];
          const labels = [...current.labels];
          ids[stop] = finalReels[stop];
          labels[stop] = finalLabels[stop];
          return { reels: ids, labels };
        });
        await wait(180);
      }
      applyFinished(finished, "Crystal Slots resolved.");
      onRefresh?.();
    } catch (error) {
      setMessage(String(error?.message || error));
    } finally {
      setSlotAnimating(false);
      setBusy("");
    }
  };

  if (!isOwnProfile) {
    return (
      <section className="panel gold-saucer-panel">
        <p className="eyebrow">v1.6.0 · Gold Saucer Alpha 2</p>
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
  const records = state?.records || {};
  const balance = state?.balance || {};
  const nextAllowanceRemaining = Math.max(0, Number(state?.next_daily_allowance_at || 0) - nowSeconds);
  const canStartTicket = Boolean(!ticket?.state || ticket.state === "resolved") && cactpotRemaining <= 0 && points >= Number(cactpot.cost || 10);
  const canSpin = slotsRemaining <= 0 && points >= Number(slots.cost || 15);
  const toss = state?.monster_toss || {};
  const tossGame = toss.active_game || null;
  const tossTargets = Array.isArray(toss.targets) ? toss.targets : [];
  const tossStyles = Array.isArray(toss.styles) ? toss.styles : [];
  const canStartToss = Boolean(toss.can_start);
  const tossResetRemaining = Math.max(0, Number(toss.next_daily_reset_at || 0) - nowSeconds);
  const revealed = new Set(Array.isArray(ticket?.revealed) ? ticket.revealed : []);
  const lastSlots = slots?.last_spin?.details || null;
  const reels = Array.isArray(lastSlots?.reels) ? lastSlots.reels : [];
  const reelLabels = Array.isArray(lastSlots?.labels) ? lastSlots.labels : [];
  const shownReels = slotAnimating ? slotDisplay.reels : reels;
  const shownLabels = slotAnimating ? slotDisplay.labels : reelLabels;
  const chosenCells = ticket?.chosen_line != null ? (cactpot.lines || []).find((line) => Number(line.index) === Number(ticket.chosen_line))?.cells || [] : [];
  const hoverCells = hoveredLine != null ? (cactpot.lines || []).find((line) => Number(line.index) === Number(hoveredLine))?.cells || [] : [];
  const highlightedCells = new Set(hoverCells.length ? hoverCells : chosenCells);
  const cactpotTier = Number(ticket?.payout || 0) >= 1000 ? "jackpot" : Number(ticket?.payout || 0) >= 300 ? "big-win" : "win";

  return (
    <section className="gold-saucer-shell">
      <section className="panel gold-saucer-hero saucer-scenic-panel">
        <img className="saucer-scenic-art saucer-lobby-art" src={`${SAUCER_ART_ROOT}/saucer-lobby.webp`} alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">v1.6.0 · Gold Saucer Alpha 2</p>
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
            <section className="panel saucer-game-card cactpot-card saucer-scenic-panel">
              <img className="saucer-scenic-art saucer-cactpot-art" src={`${SAUCER_ART_ROOT}/mini-cactpot.webp`} alt="" aria-hidden="true" />
              <div className="panel-title-row">
                <div><p className="eyebrow">Daily Attraction</p><h3>Mini Cactpot</h3></div>
                <span className={`small-badge ${cactpotRemaining <= 0 && (!ticket || ticket.state === "resolved") ? "ready" : ""}`}>{ticket?.state === "reveal" ? `${number(ticket.reveals_remaining)} reveals left` : ticket?.state === "line" ? "Choose a line" : cactpotRemaining > 0 ? `Next ${duration(cactpotRemaining)}` : "Daily ticket ready"}</span>
              </div>
              <p className="muted">Reveal four cells total, preview any row, column, or diagonal, then choose your payout line. New tickets reset at 00:00 UTC.</p>
              {ticket ? (
                <>
                  <div className="cactpot-grid" aria-label="Mini Cactpot ticket">
                    {(ticket.grid || Array(9).fill(null)).map((value, index) => (
                      <button
                        type="button"
                        key={index}
                        className={`cactpot-cell ${value != null ? "revealed" : "hidden"} ${highlightedCells.has(index) ? "line-highlight" : ""}`}
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
                        {(cactpot.lines || []).map((line) => <button type="button" className="equipment-action-button secondary" key={line.index} disabled={!actionsAvailable || Boolean(busy)} onMouseEnter={() => setHoveredLine(line.index)} onMouseLeave={() => setHoveredLine(null)} onFocus={() => setHoveredLine(line.index)} onBlur={() => setHoveredLine(null)} onClick={() => mutate(`line-${line.index}`, () => submitCactpotLine(line.index, csrfToken, actionKey("cactpot-line", line.index)), "Resolving Mini Cactpot…")}>{LINE_NAMES[line.index] || `Line ${line.index + 1}`}</button>)}
                      </div>
                    </div>
                  ) : null}
                  {ticket.state === "resolved" ? <div className={`saucer-result cactpot-result ${cactpotTier}`}><div><strong>{number(ticket.payout)} SP won</strong><small>{ticket.line_sum ? `Line total ${number(ticket.line_sum)}` : "Ticket complete"}</small></div><span>{LINE_NAMES[ticket.chosen_line] || "Chosen line"}</span></div> : null}
                </>
              ) : null}
              {(!ticket || ticket.state === "resolved") ? (
                <div className="card-actions">
                  <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !canStartTicket} onClick={() => mutate("cactpot-start", () => submitCactpotStart(csrfToken, actionKey("cactpot-start")), "Opening Mini Cactpot ticket…")}>{busy === "cactpot-start" ? "Opening…" : cactpotRemaining > 0 ? `Next Ticket ${duration(cactpotRemaining)}` : points < Number(cactpot.cost || 10) ? "Not Enough SP" : "Open Daily Ticket"}</button>
                </div>
              ) : null}
            </section>

            <section className="panel saucer-game-card slots-card saucer-scenic-panel">
              <img className="saucer-scenic-art saucer-slots-art" src={`${SAUCER_ART_ROOT}/crystal-slots.webp`} alt="" aria-hidden="true" />
              <div className="panel-title-row">
                <div><p className="eyebrow">Quick Attraction</p><h3>Crystal Slots</h3></div>
                <span className="small-badge">{number(slots.cost || 15)} SP / spin</span>
              </div>
              <p className="muted">Three matching symbols pay the most; any pair pays a smaller win. The Bot commits the result first, then the reels animate locally for presentation.</p>
              <div className={`saucer-reels ${slotAnimating ? "is-spinning" : ""}`} aria-label={slotAnimating ? "Crystal Slots reels spinning" : "Last Crystal Slots result"}>
                {[0, 1, 2].map((index) => <Reel key={index} id={shownReels[index]} label={shownLabels[index]} />)}
              </div>
              {slots.last_spin && !slotAnimating ? <div className={`saucer-result slot-result ${String(slots.last_spin.details?.result_tier || slots.last_spin.outcome || "spin")}`}><strong>{slots.last_spin.payout > 0 ? `+${number(slots.last_spin.payout)} SP` : "No payout"}</strong><span>{String(slots.last_spin.outcome || "spin").replaceAll("_", " ")}</span></div> : slotAnimating ? <p className="saucer-instruction spin-callout">Reels are stopping…</p> : <p className="saucer-instruction">No spins recorded yet.</p>}
              <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !canSpin} onClick={() => void spinSlots()}>{busy === "slots" ? "Spinning…" : slotsRemaining > 0 ? `Ready in ${duration(slotsRemaining)}` : points < Number(slots.cost || 15) ? "Not Enough SP" : `Spin · ${number(slots.cost || 15)} SP`}</button>
            </section>
          </div>

          <section className="panel saucer-game-card monster-toss-card">
            <div className="panel-title-row">
              <div><p className="eyebrow">Alpha 2 Attraction</p><h3>Monster Toss</h3></div>
              <span className={`small-badge ${tossGame ? "ready" : ""}`}>{tossGame ? `${number(tossGame.throws_remaining)} throws left` : `${number(toss.games_remaining)} / ${number(toss.daily_games || 3)} games left`}</span>
            </div>
            <p className="muted">Five throws per game. Choose a target, then choose Safe, Normal, or Power. Harder targets and riskier throws score more, but the Bot resolves every hit authoritatively.</p>
            {tossGame ? (
              <>
                <div className="monster-toss-scoreboard">
                  <div><span>Score</span><strong>{number(tossGame.score)}</strong></div>
                  <div><span>Throw</span><strong>{number(tossGame.throw_index)} / {number(toss.throws_per_game || 5)}</strong></div>
                </div>
                <div className="monster-toss-target-grid">
                  {tossTargets.map((target) => <button type="button" key={target.id} className={`monster-toss-choice ${tossTarget === target.id ? "selected" : ""}`} onClick={() => setTossTarget(target.id)} disabled={Boolean(busy)}><strong>{target.name}</strong><span>{number(target.points)} base pts</span><small>{Math.round(Number(target.accuracy || 0) * 100)}% base accuracy</small></button>)}
                </div>
                <div className="monster-toss-style-grid">
                  {tossStyles.map((style) => <button type="button" key={style.id} className={`monster-toss-choice style ${tossStyle === style.id ? "selected" : ""}`} onClick={() => setTossStyle(style.id)} disabled={Boolean(busy)}><strong>{style.name}</strong><small>{style.description}</small></button>)}
                </div>
                <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy)} onClick={() => mutate("monster-toss-throw", () => submitMonsterTossThrow(tossTarget, tossStyle, csrfToken, actionKey("monster-toss-throw", `${tossTarget}-${tossStyle}`)), "Throwing…")}>{busy === "monster-toss-throw" ? "Throwing…" : "Take Throw"}</button>
                <div className="monster-toss-log">{(tossGame.throws || []).slice().reverse().map((entry) => <div key={entry.throw}><span>Throw {entry.throw}: {entry.target_name} · {entry.style_name}</span><strong className={entry.hit ? "positive" : ""}>{entry.hit ? `HIT +${number(entry.points)}` : "MISS"}</strong></div>)}</div>
              </>
            ) : (
              <div className="monster-toss-start">
                <div className="saucer-result"><strong>{number(toss.cost || 20)} SP entry</strong><span>{number(toss.throws_per_game || 5)} throws · {number(toss.daily_games || 3)} games/day</span></div>
                <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !canStartToss} onClick={() => mutate("monster-toss-start", () => submitMonsterTossStart(csrfToken, actionKey("monster-toss-start")), "Opening Monster Toss…")}>{busy === "monster-toss-start" ? "Opening…" : Number(toss.games_remaining || 0) <= 0 ? `Daily reset ${duration(tossResetRemaining)}` : points < Number(toss.cost || 20) ? "Not Enough SP" : `Start Game · ${number(toss.cost || 20)} SP`}</button>
              </div>
            )}
            <details className="saucer-balance-notes"><summary>Score rewards</summary><div className="monster-toss-payouts">{(toss.payouts || []).filter((row) => Number(row.minimum_score) > 0).map((row) => <span key={row.tier}><b>{number(row.minimum_score)}+</b> → {number(row.payout)} SP</span>)}</div></details>
          </section>

          <section className="panel saucer-prize-panel saucer-scenic-panel">
            <img className="saucer-scenic-art saucer-prize-art" src={`${SAUCER_ART_ROOT}/prize-counter.webp`} alt="" aria-hidden="true" />
            <div className="panel-title-row">
              <div><p className="eyebrow">Cosmetic Rewards</p><h3>Prize Counter</h3></div>
              <span className="small-badge">Titles Only · Alpha 2</span>
            </div>
            <p className="muted">Spend SP on collectible titles. Gold Saucer prizes are cosmetic only and never grant combat stats, Gil, items, or progression advantages.</p>
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
            <div className="panel-title-row"><div><p className="eyebrow">Personal Records</p><h3>Saucer Ledger</h3></div><span className="small-badge">Alpha 2</span></div>
            <div className="saucer-record-grid">
              <div><span>Current Net SP</span><strong>{Number(records.net_points || 0) >= 0 ? "+" : ""}{number(records.net_points)} SP</strong></div>
              <div><span>Games Played</span><strong>{number(records.games_played)}</strong></div>
              <div><span>Prizes Collected</span><strong>{number(state.account?.prizes_bought)}</strong></div>
              <div><span>Cactpot Tickets</span><strong>{number(state.account?.cactpot_plays)}</strong></div>
              <div><span>Best Cactpot</span><strong>{number(state.account?.cactpot_best_payout)} SP</strong></div>
              <div><span>Cactpot High Rolls</span><strong>{number(records.cactpot_high_rolls)}</strong></div>
              <div><span>Slot Spins</span><strong>{number(state.account?.slots_spins)}</strong></div>
              <div><span>Slot Win Rate</span><strong>{Number(records.slots_win_rate_pct || 0).toFixed(1)}%</strong></div>
              <div><span>Triple Matches</span><strong>{number(records.slots_triples)}</strong></div>
              <div><span>Best Slots</span><strong>{number(state.account?.slots_best_payout)} SP</strong></div>
              <div><span>Monster Toss Games</span><strong>{number(records.monster_toss_games)}</strong></div>
              <div><span>Best Toss Score</span><strong>{number(records.monster_toss_best_score)}</strong></div>
              <div><span>Toss Accuracy</span><strong>{Number(records.monster_toss_accuracy_pct || 0).toFixed(1)}%</strong></div>
              <div><span>Best Toss Payout</span><strong>{number(records.monster_toss_best_payout)} SP</strong></div>
              <div><span>Lifetime Earned</span><strong>{number(state.account?.lifetime_earned)} SP</strong></div>
              <div><span>Lifetime Spent</span><strong>{number(state.account?.lifetime_spent)} SP</strong></div>
            </div>
            <details className="saucer-balance-notes">
              <summary>Balance details</summary>
              <p className="muted">Your realized slot return is <b>{Number(records.slots_realized_return_pct || 0).toFixed(1)}%</b>. The current long-run payout target is about <b>{Number(balance.slots_theoretical_return_pct || 87.5).toFixed(1)}%</b>. Short sessions can vary dramatically.</p>
            </details>
          </section>

          <details className="panel saucer-history-panel saucer-disclosure">
            <summary><span><span className="eyebrow">Recent Activity</span><strong>Last Eight Entries</strong></span><span className="small-badge">{number(history.length)}</span></summary>
            {history.length ? (
              <div className="saucer-history-list">
                {history.map((entry, index) => {
                  const game = String(entry.game || "activity").replaceAll("_", " ");
                  const details = entry.details || {};
                  const label = entry.game === "prize" ? String(details.name || entry.outcome || "Prize") : entry.game === "daily_allowance" ? "Daily floor allowance" : entry.game === "welcome" ? "Welcome purse" : entry.game === "monster_toss" ? `Monster Toss · ${number(details.score || 0)} pts` : game;
                  return <div className="saucer-history-row" key={`${entry.created_at || 0}-${index}`}>
                    <span><strong>{label}</strong><small>{entry.game === "slots" && Array.isArray(details.labels) ? details.labels.join(" · ") : entry.game === "monster_toss" ? `${number(details.hits || 0)} / ${number(details.throws || 0)} hits · ${String(entry.outcome || "").replaceAll("_", " ")}` : String(entry.outcome || "").replaceAll("_", " ")}</small></span>
                    <b className={Number(entry.payout || 0) > Number(entry.wager || 0) ? "positive" : ""}>{Number(entry.payout || 0) > 0 ? `+${number(entry.payout)} SP` : Number(entry.wager || 0) > 0 ? `−${number(entry.wager)} SP` : "—"}</b>
                  </div>;
                })}
              </div>
            ) : <p className="muted">No Gold Saucer activity recorded yet.</p>}
          </details>

          <section className="panel saucer-attractions-panel">
            <div className="panel-title-row"><div><p className="eyebrow">Coming Next</p><h3>Future Attractions</h3></div></div>
            <div className="saucer-attraction-grid future-only">
              {(state.attractions || []).filter((attraction) => attraction.status !== "open").map((attraction) => (
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
