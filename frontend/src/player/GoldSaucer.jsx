import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitCactpotLine,
  submitCactpotReveal,
  submitCactpotStart,
  submitGoldSaucerState,
  submitMonsterTossStart,
  submitMonsterTossThrow,
  submitChocoboRace,
  submitTriadSetDeck,
  submitTriadStart,
  submitTriadPlay,
  submitSaucerBuy,
  submitSlotsSpin,
  waitForPortalAction,
} from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number } from "../utils/formatters.js";
import { DetailsPointer } from "../components/CollapsePointer.jsx";

const LINE_NAMES = ["Top Row", "Middle Row", "Bottom Row", "Left Column", "Center Column", "Right Column", "Down Diagonal", "Up Diagonal"];
const SAUCER_ART_ROOT = "/gold-saucer/a1h1";
const TOSS_ART_ROOT = "/gold-saucer/a2h2/monster-toss";
const CHOCOBO_PORTRAIT_ROOT = "/retro-phase-iii/chocobo-portraits-v1";
const RACE_ART_ROOT = "/gold-saucer/a4h1/chocobo-racing";
const TRIAD_ART_ROOT = "/gold-saucer/a5h5/triple-triad";
const TRIAD_CARD_ART_ROOT = "/gold-saucer/rc2h1/triple-triad/cards";
const TRIAD_ART_FALLBACK = `${SAUCER_ART_ROOT}/saucer-lobby.webp`;
const TRIAD_CARD_ART = Object.fromEntries(["chocobo", "moogle", "cactuar", "bomb", "flan", "tonberry", "coeurl", "ahriman", "malboro", "ifrit", "shiva", "ramuh", "leviathan", "bahamut", "odin"].map((id) => [id, `${TRIAD_CARD_ART_ROOT}/${id}.webp`]));
const TRIAD_OPPONENT_ART = {
  saucer_attendant: `${TRIAD_ART_ROOT}/opponents/saucer_attendant.webp`,
  card_shark: `${TRIAD_ART_ROOT}/opponents/card_shark.webp`,
  crystal_master: `${TRIAD_ART_ROOT}/opponents/crystal_master.webp`,
};
const RACE_COURSE_ART = {
  manderville_sprint: `${RACE_ART_ROOT}/courses/manderville-sprint.webp`,
  crystal_circuit: `${RACE_ART_ROOT}/courses/crystal-circuit.webp`,
  golden_gauntlet: `${RACE_ART_ROOT}/courses/golden-gauntlet.webp`,
};
const RACE_STRATEGY_ART = {
  steady: `${RACE_ART_ROOT}/pace/steady.webp`,
  balanced: `${RACE_ART_ROOT}/pace/balanced.webp`,
  sprint: `${RACE_ART_ROOT}/pace/sprint.webp`,
};
const TOSS_TARGET_ART = {
  small_pot: `${TOSS_ART_ROOT}/targets/small-pot.webp`,
  medium_pot: `${TOSS_ART_ROOT}/targets/medium-pot.webp`,
  large_pot: `${TOSS_ART_ROOT}/targets/large-pot.webp`,
  golden_cactuar: `${TOSS_ART_ROOT}/targets/golden-cactuar.webp`,
};
const TOSS_STYLE_ART = {
  safe: `${TOSS_ART_ROOT}/styles/safe.webp`,
  normal: `${TOSS_ART_ROOT}/styles/normal.webp`,
  power: `${TOSS_ART_ROOT}/styles/power.webp`,
};
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

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value.filter((entry) => entry != null) : [];
}

function asObjectArray(value) {
  return asArray(value).filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry));
}

function displayText(value, fallback = "—") {
  if (value == null || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function displayId(value, fallback = "unknown") {
  const text = displayText(value, fallback).toLowerCase();
  return text.replace(/[^a-z0-9_-]+/g, "-");
}

function triadRarity(value) {
  const parsed = Math.floor(Number(value || 1));
  return Number.isFinite(parsed) ? Math.max(1, Math.min(5, parsed)) : 1;
}

function racePlaceLabel(value) {
  const place = Number(value || 0);
  if (place === 1) return "1st";
  if (place === 2) return "2nd";
  if (place === 3) return "3rd";
  return place > 0 ? `${place}th` : "—";
}

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

function ArtImage({ src, fallbackSrc = "", ...props }) {
  return (
    <img
      {...props}
      src={src}
      onError={(event) => {
        const image = event.currentTarget;
        if (fallbackSrc && image.dataset.fallbackAttempted !== "1") {
          image.dataset.fallbackAttempted = "1";
          image.src = fallbackSrc;
          return;
        }
        image.hidden = true;
      }}
    />
  );
}

function Reel({ id, label }) {
  const art = SLOT_ART[id] || null;
  return (
    <div className={`saucer-reel symbol-${id || "empty"}`}>
      {art ? <img className="saucer-slot-symbol" src={art} alt="" aria-hidden="true" /> : <span className="saucer-slot-placeholder" aria-hidden="true">✧</span>}
      <small>{displayText(label, displayText(id))}</small>
    </div>
  );
}

function triadAccessibleLabel(card) {
  const name = displayText(card?.name, "Unknown Card");
  const rarity = triadRarity(card?.rarity);
  return `${name}, ${rarity}-star card. Top ${displayText(card?.top, "0")}, right ${displayText(card?.right, "0")}, bottom ${displayText(card?.bottom, "0")}, left ${displayText(card?.left, "0")}.`;
}

function TriadCard({ card, owner = "player", selected = false, disabled = false, onClick = null, compact = false }) {
  if (!card) return null;
  const cardId = displayId(card.id, "unknown");
  const art = TRIAD_CARD_ART[cardId] || null;
  const label = triadAccessibleLabel(card);
  const content = art
    ? <span className="triad-card-art" aria-hidden="true"><ArtImage src={art} fallbackSrc={`${TRIAD_ART_ROOT}/cards/card-back.webp`} alt="" /></span>
    : <span className="triad-card-missing" aria-hidden="true">?</span>;
  if (onClick) {
    return <button type="button" className={`triad-card full-face owner-${owner} ${selected ? "selected" : ""} ${compact ? "compact" : ""}`} disabled={disabled} onClick={onClick} aria-pressed={selected} aria-label={label}>{content}</button>;
  }
  return <div className={`triad-card full-face owner-${owner} ${selected ? "selected" : ""} ${compact ? "compact" : ""}`} role="img" aria-label={label}>{content}</div>;
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
  const [raceCourse, setRaceCourse] = useState("manderville_sprint");
  const [raceStrategy, setRaceStrategy] = useState("balanced");
  const [triadOpponent, setTriadOpponent] = useState("saucer_attendant");
  const [triadDeckDraft, setTriadDeckDraft] = useState([]);
  const [triadSelectedCard, setTriadSelectedCard] = useState("");

  const username = String(overview?.identity?.username || data?.identity?.username || "").toLowerCase();
  const isOwnProfile = Boolean(auth.authenticated && auth.player?.username && String(auth.player.username).toLowerCase() === username);
  const capabilities = useMemo(() => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []), [auth.action_capabilities]);
  const required = ["GOLD_SAUCER_STATE", "CACTPOT_START", "CACTPOT_REVEAL", "CACTPOT_LINE", "SLOTS_SPIN", "MONSTER_TOSS_START", "MONSTER_TOSS_THROW", "CHOCOBO_RACE", "TRIAD_SET_DECK", "TRIAD_START", "TRIAD_PLAY", "SAUCER_BUY"];
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

  useEffect(() => {
    const courses = asObjectArray(asRecord(state?.chocobo_racing).courses);
    if (!courses.length || courses.some((course) => course.id === raceCourse)) return;
    setRaceCourse((courses.find((course) => course.eligible) || courses[0]).id);
  }, [state, raceCourse]);

  useEffect(() => {
    const triad = asRecord(state?.triple_triad);
    const deck = asArray(triad.deck).filter((cardId) => typeof cardId === "string");
    if (deck.length === 5 && triadDeckDraft.length === 0) setTriadDeckDraft([...deck]);
    const opponents = asObjectArray(triad.opponents);
    if (opponents.length && !opponents.some((row) => row.id === triadOpponent && row.unlocked)) {
      setTriadOpponent((opponents.find((row) => row.unlocked) || opponents[0]).id);
    }
    const hand = asObjectArray(asRecord(triad.match).player_hand);
    if (triadSelectedCard && !hand.some((card) => card.id === triadSelectedCard)) setTriadSelectedCard("");
  }, [state, triadDeckDraft.length, triadOpponent, triadSelectedCard]);

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
        <p className="eyebrow">v1.6.0 · Gold Saucer</p>
        <h2>Gold Saucer</h2>
        <p className="muted">Gold Saucer play and balances are private to the signed-in adventurer. Open your own profile to enter the floor.</p>
      </section>
    );
  }

  const nowSeconds = Math.floor(clock / 1000);
  const saucerState = asRecord(state);
  const cactpot = asRecord(saucerState.cactpot);
  const ticket = Object.keys(asRecord(cactpot.ticket)).length ? asRecord(cactpot.ticket) : null;
  const cactpotRemaining = Math.max(0, Number(cactpot.available_at || 0) - nowSeconds);
  const slots = asRecord(saucerState.slots);
  const slotsRemaining = Math.max(0, Number(slots.available_at || 0) - nowSeconds);
  const account = asRecord(saucerState.account);
  const mgp = Number(saucerState.mgp ?? saucerState.points ?? account.mgp ?? account.points ?? 0);
  const currencyCode = String(saucerState.currency_code || saucerState.currency_name || "MGP");
  const dailyAllowanceMgp = Number(saucerState.daily_allowance_mgp ?? saucerState.daily_allowance_points ?? 50);
  const prizes = asObjectArray(saucerState.prizes);
  const history = asObjectArray(saucerState.history);
  const records = asRecord(saucerState.records);
  const netMgp = Number(records.net_mgp ?? records.net_points ?? 0);
  const balance = asRecord(saucerState.balance);
  const nextAllowanceRemaining = Math.max(0, Number(saucerState.next_daily_allowance_at || 0) - nowSeconds);
  const canStartTicket = Boolean(!ticket?.state || ticket.state === "resolved") && cactpotRemaining <= 0 && mgp >= Number(cactpot.cost || 10);
  const canSpin = slotsRemaining <= 0 && mgp >= Number(slots.cost || 15);
  const toss = asRecord(saucerState.monster_toss);
  const tossGame = Object.keys(asRecord(toss.active_game)).length ? asRecord(toss.active_game) : null;
  const tossTargets = asObjectArray(toss.targets);
  const tossStyles = asObjectArray(toss.styles);
  const canStartToss = Boolean(toss.can_start);
  const tossResetRemaining = Math.max(0, Number(toss.next_daily_reset_at || 0) - nowSeconds);
  const racing = asRecord(saucerState.chocobo_racing);
  const raceCourses = asObjectArray(racing.courses);
  const raceStrategies = asObjectArray(racing.strategies);
  const selectedRaceCourse = raceCourses.find((course) => course.id === raceCourse) || raceCourses[0] || null;
  const selectedRaceStrategy = raceStrategies.find((strategy) => strategy.id === raceStrategy) || raceStrategies[0] || null;
  const raceResetRemaining = Math.max(0, Number(racing.next_daily_reset_at || 0) - nowSeconds);
  const raceCompanion = Object.keys(asRecord(racing.companion)).length ? asRecord(racing.companion) : null;
  const lastRace = Object.keys(asRecord(racing.last_race)).length ? asRecord(racing.last_race) : null;
  const lastRaceDetails = asRecord(lastRace?.details);
  const raceCanEnter = Boolean(selectedRaceCourse?.can_enter);
  const triad = asRecord(saucerState.triple_triad);
  const triadCollection = asObjectArray(triad.collection);
  const triadOwnedCards = triadCollection.filter((card) => Boolean(card.owned));
  const triadOpponents = asObjectArray(triad.opponents);
  const selectedTriadOpponent = triadOpponents.find((row) => row.id === triadOpponent) || triadOpponents[0] || null;
  const triadMatch = Object.keys(asRecord(triad.match)).length ? asRecord(triad.match) : null;
  const triadMatchOpponent = triadOpponents.find((row) => row.id === triadMatch?.opponent_id) || null;
  const triadBoard = Array.isArray(triadMatch?.board) ? triadMatch.board.slice(0, 9) : Array(9).fill(null);
  while (triadBoard.length < 9) triadBoard.push(null);
  const triadHand = asObjectArray(triadMatch?.player_hand);
  const triadResetRemaining = Math.max(0, Number(triad.next_daily_reset_at || 0) - nowSeconds);
  const savedTriadDeck = asArray(triad.deck).filter((cardId) => typeof cardId === "string");
  const triadDeckChanged = triadDeckDraft.length === 5 && JSON.stringify(triadDeckDraft) !== JSON.stringify(savedTriadDeck);
  const triadCanStart = Boolean(selectedTriadOpponent?.can_start) && triadDeckDraft.length === 5;
  const triadResultKey = ["win", "loss", "draw"].includes(String(triadMatch?.result || "")) ? String(triadMatch.result) : "draw";
  const futureAttractions = asObjectArray(saucerState.attractions).filter((attraction) => attraction.status !== "open");
  const revealed = new Set(asArray(ticket?.revealed));
  const lastSlots = slots?.last_spin?.details || null;
  const reels = Array.isArray(lastSlots?.reels) ? lastSlots.reels : [];
  const reelLabels = Array.isArray(lastSlots?.labels) ? lastSlots.labels : [];
  const shownReels = slotAnimating ? slotDisplay.reels : reels;
  const shownLabels = slotAnimating ? slotDisplay.labels : reelLabels;
  const chosenCells = ticket?.chosen_line != null ? asArray(asObjectArray(cactpot.lines).find((line) => Number(line.index) === Number(ticket.chosen_line))?.cells) : [];
  const hoverCells = hoveredLine != null ? asArray(asObjectArray(cactpot.lines).find((line) => Number(line.index) === Number(hoveredLine))?.cells) : [];
  const highlightedCells = new Set(hoverCells.length ? hoverCells : chosenCells);
  const cactpotTier = Number(ticket?.payout || 0) >= 1000 ? "jackpot" : Number(ticket?.payout || 0) >= 300 ? "big-win" : "win";
  const tossThrows = asObjectArray(tossGame?.throws);
  const lastTossThrow = tossThrows.length ? tossThrows[tossThrows.length - 1] : null;
  const lastTossHistory = history.find((entry) => entry.game === "monster_toss") || null;
  const lastTossDetails = lastTossHistory?.details || {};
  const lastTossTier = String(lastTossDetails.tier || lastTossHistory?.outcome || "miss");
  const lastTossResultArt = lastTossTier === "jackpot"
    ? `${TOSS_ART_ROOT}/results/jackpot.webp`
    : Number(lastTossHistory?.payout || 0) > 0
      ? `${TOSS_ART_ROOT}/results/bullseye.webp`
      : `${TOSS_ART_ROOT}/results/miss.webp`;

  return (
    <section className="gold-saucer-shell">
      <section className="panel gold-saucer-hero saucer-scenic-panel">
        <img className="saucer-scenic-art saucer-lobby-art" src={`${SAUCER_ART_ROOT}/saucer-lobby.webp`} alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">v1.6.0 · Gold Saucer</p>
          <h2>Gold Saucer</h2>
          <p className="muted">A low-stakes side hall for daily luck, quick games, Chocobo Racing, Triple Triad, cosmetic rewards, and collection records. First visit includes a 500 MGP welcome purse.</p>
        </div>
        <div className="saucer-balance">
          <span>Current Balance</span>
          <strong>{number(mgp)} {currencyCode}</strong>
          <small>Manderville Gold Saucer Points (MGP) cannot be purchased with Gil. After your welcome day, the floor grants {number(dailyAllowanceMgp)} MGP once per UTC day so you can always play again.</small>
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
                    {(Array.isArray(ticket.grid) ? ticket.grid : Array(9).fill(null)).map((value, index) => (
                      <button
                        type="button"
                        key={index}
                        className={`cactpot-cell ${value != null ? "revealed" : "hidden"} ${highlightedCells.has(index) ? "line-highlight" : ""}`}
                        disabled={!actionsAvailable || Boolean(busy) || ticket.state !== "reveal" || revealed.has(index)}
                        onClick={() => mutate(`reveal-${index}`, () => submitCactpotReveal(index, csrfToken, actionKey("cactpot-reveal", index)), "Revealing Mini Cactpot cell…")}
                        aria-label={value != null ? `Cell ${index + 1}: ${displayText(value, "?")}` : `Reveal cell ${index + 1}`}
                      >{value != null ? displayText(value, "?") : "?"}</button>
                    ))}
                  </div>
                  {ticket.state === "reveal" ? <p className="saucer-instruction">Reveal {number(ticket.reveals_remaining)} more cell{Number(ticket.reveals_remaining) === 1 ? "" : "s"}.</p> : null}
                  {ticket.state === "line" ? (
                    <div className="cactpot-lines">
                      <span className="slot-label">Choose one payout line</span>
                      <div className="cactpot-line-buttons">
                        {asObjectArray(cactpot.lines).map((line) => <button type="button" className="equipment-action-button secondary" key={line.index} disabled={!actionsAvailable || Boolean(busy)} onMouseEnter={() => setHoveredLine(line.index)} onMouseLeave={() => setHoveredLine(null)} onFocus={() => setHoveredLine(line.index)} onBlur={() => setHoveredLine(null)} onClick={() => mutate(`line-${line.index}`, () => submitCactpotLine(line.index, csrfToken, actionKey("cactpot-line", line.index)), "Resolving Mini Cactpot…")}>{LINE_NAMES[line.index] || `Line ${line.index + 1}`}</button>)}
                      </div>
                    </div>
                  ) : null}
                  {ticket.state === "resolved" ? <div className={`saucer-result cactpot-result ${cactpotTier}`}><div><strong>{number(ticket.payout)} MGP won</strong><small>{ticket.line_sum ? `Line total ${number(ticket.line_sum)}` : "Ticket complete"}</small></div><span>{LINE_NAMES[ticket.chosen_line] || "Chosen line"}</span></div> : null}
                </>
              ) : null}
              {(!ticket || ticket.state === "resolved") ? (
                <div className="card-actions">
                  <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !canStartTicket} onClick={() => mutate("cactpot-start", () => submitCactpotStart(csrfToken, actionKey("cactpot-start")), "Opening Mini Cactpot ticket…")}>{busy === "cactpot-start" ? "Opening…" : cactpotRemaining > 0 ? `Next Ticket ${duration(cactpotRemaining)}` : mgp < Number(cactpot.cost || 10) ? "Not Enough MGP" : "Open Daily Ticket"}</button>
                </div>
              ) : null}
            </section>

            <section className="panel saucer-game-card slots-card saucer-scenic-panel">
              <img className="saucer-scenic-art saucer-slots-art" src={`${SAUCER_ART_ROOT}/crystal-slots.webp`} alt="" aria-hidden="true" />
              <div className="panel-title-row">
                <div><p className="eyebrow">Quick Attraction</p><h3>Crystal Slots</h3></div>
                <span className="small-badge">{number(slots.cost || 15)} MGP / spin</span>
              </div>
              <p className="muted">Three matching symbols pay the most; any pair pays a smaller win. The Bot commits the result first, then the reels animate locally for presentation.</p>
              <div className={`saucer-reels ${slotAnimating ? "is-spinning" : ""}`} aria-label={slotAnimating ? "Crystal Slots reels spinning" : "Last Crystal Slots result"}>
                {[0, 1, 2].map((index) => <Reel key={index} id={shownReels[index]} label={shownLabels[index]} />)}
              </div>
              {slots.last_spin && !slotAnimating ? <div className={`saucer-result slot-result ${String(slots.last_spin.details?.result_tier || slots.last_spin.outcome || "spin")}`}><strong>{slots.last_spin.payout > 0 ? `+${number(slots.last_spin.payout)} MGP` : "No payout"}</strong><span>{String(slots.last_spin.outcome || "spin").replaceAll("_", " ")}</span></div> : slotAnimating ? <p className="saucer-instruction spin-callout">Reels are stopping…</p> : <p className="saucer-instruction">No spins recorded yet.</p>}
              <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !canSpin} onClick={() => void spinSlots()}>{busy === "slots" ? "Spinning…" : slotsRemaining > 0 ? `Ready in ${duration(slotsRemaining)}` : mgp < Number(slots.cost || 15) ? "Not Enough MGP" : `Spin · ${number(slots.cost || 15)} MGP`}</button>
            </section>
          </div>

          <details className="panel saucer-game-card monster-toss-card monster-toss-scenic-panel saucer-section-disclosure" defaultOpen={Boolean(tossGame)}>
            <summary className="saucer-section-summary monster-toss-title-row">
              <div><p className="eyebrow">Alpha 2 Attraction</p><h3>Monster Toss</h3></div>
              <span className={`small-badge ${tossGame ? "ready" : ""}`}>{tossGame ? `${number(tossGame.throws_remaining)} throws left` : `${number(toss.games_remaining)} / ${number(toss.daily_games || 3)} games left`}</span>
              <DetailsPointer className="saucer-details-pointer" />
            </summary>
            <img className="monster-toss-background" src={`${TOSS_ART_ROOT}/background.webp`} alt="" aria-hidden="true" />
            <div className="monster-toss-scenic-shade" aria-hidden="true" />
            <div className="monster-toss-content saucer-section-body">
              <p className="muted monster-toss-intro">Five throws per game. Choose a target, then choose Safe, Normal, or Power. Harder targets and riskier throws score more, while every hit and payout remains Bot-authoritative.</p>
              {tossGame ? (
                <>
                  <div className="monster-toss-status-art">
                    <div className="monster-toss-score-art">
                      <img src={`${TOSS_ART_ROOT}/ui/scoreboard.webp`} alt="" aria-hidden="true" />
                      <div className="monster-toss-score-overlay"><span>Current Score</span><strong>{number(tossGame.score)}</strong></div>
                    </div>
                    <div className="monster-toss-throws-art">
                      <img src={`${TOSS_ART_ROOT}/ui/throws-left.webp`} alt="" aria-hidden="true" />
                      <div className="monster-toss-throws-overlay"><strong>{number(tossGame.throws_remaining)}</strong><span>throws left</span></div>
                    </div>
                  </div>

                  <div className="monster-toss-target-grid" aria-label="Monster Toss targets">
                    {tossTargets.map((target) => (
                      <button type="button" key={target.id} className={`monster-toss-choice target ${tossTarget === target.id ? "selected" : ""}`} onClick={() => setTossTarget(target.id)} disabled={Boolean(busy)}>
                        <span className="monster-toss-target-art-wrap">
                          <img className="monster-toss-target-art" src={TOSS_TARGET_ART[displayText(target.id, "")]} alt="" aria-hidden="true" />
                          {tossTarget === target.id ? <img className="monster-toss-reticle" src={`${TOSS_ART_ROOT}/reticle.webp`} alt="" aria-hidden="true" /> : null}
                        </span>
                        <strong>{displayText(target.name, "Target")}</strong>
                        <span>{number(target.points)} base pts</span>
                        <small>{Math.round(Number(target.accuracy || 0) * 100)}% base accuracy</small>
                      </button>
                    ))}
                  </div>

                  <div className="monster-toss-style-grid" aria-label="Monster Toss throw styles">
                    {tossStyles.map((style) => (
                      <button type="button" key={style.id} className={`monster-toss-choice style ${tossStyle === style.id ? "selected" : ""}`} onClick={() => setTossStyle(style.id)} disabled={Boolean(busy)}>
                        <img className="monster-toss-style-art" src={TOSS_STYLE_ART[displayText(style.id, "")]} alt="" aria-hidden="true" />
                        <strong>{displayText(style.name, "Throw Style")}</strong>
                        <small>{displayText(style.description, "Choose a throwing style.")}</small>
                      </button>
                    ))}
                  </div>

                  <div className="monster-toss-throw-stage">
                    <img className="monster-toss-projectile" src={`${TOSS_ART_ROOT}/projectile.webp`} alt="" aria-hidden="true" />
                    <button type="button" className="equipment-action-button monster-toss-throw-button" disabled={!actionsAvailable || Boolean(busy)} onClick={() => mutate("monster-toss-throw", () => submitMonsterTossThrow(tossTarget, tossStyle, csrfToken, actionKey("monster-toss-throw", `${tossTarget}-${tossStyle}`)), "Throwing…")}>{busy === "monster-toss-throw" ? "Throwing…" : "Take Throw"}</button>
                  </div>

                  {lastTossThrow ? (
                    <div className={`monster-toss-last-result ${lastTossThrow.hit ? "hit" : "miss"}`}>
                      <img src={`${TOSS_ART_ROOT}/results/${lastTossThrow.hit ? "hit" : "miss"}.webp`} alt="" aria-hidden="true" />
                      <div><strong>{lastTossThrow.hit ? `HIT +${number(lastTossThrow.points)}` : "MISS"}</strong><span>{displayText(lastTossThrow.target_name, "Target")} · {displayText(lastTossThrow.style_name, "Throw")}</span></div>
                    </div>
                  ) : null}

                  <div className="monster-toss-log">{tossThrows.slice().reverse().map((entry) => <div key={entry.throw}><span className="monster-toss-log-main"><img src={`${TOSS_ART_ROOT}/results/${entry.hit ? "hit" : "miss"}.webp`} alt="" aria-hidden="true" /><span>Throw {displayText(entry.throw, "?")}: {displayText(entry.target_name, "Target")} · {displayText(entry.style_name, "Throw")}</span></span><strong className={entry.hit ? "positive" : ""}>{entry.hit ? `HIT +${number(entry.points)}` : "MISS"}</strong></div>)}</div>
                </>
              ) : (
                <div className="monster-toss-start">
                  <img className="monster-toss-play-banner" src={`${TOSS_ART_ROOT}/ui/play-banner.webp`} alt="Play Monster Toss" />
                  {lastTossHistory ? (
                    <div className={`monster-toss-final-result tier-${lastTossTier}`}>
                      <img src={lastTossResultArt} alt="" aria-hidden="true" />
                      <div><span>Last Game</span><strong>{number(lastTossDetails.score || 0)} pts · {number(lastTossHistory.payout || 0)} MGP</strong><small>{String(lastTossTier).replaceAll("_", " ")}</small></div>
                    </div>
                  ) : null}
                  <div className="saucer-result monster-toss-entry-card"><strong>{number(toss.cost || 20)} MGP entry</strong><span>{number(toss.throws_per_game || 5)} throws · {number(toss.daily_games || 3)} games/day</span></div>
                  <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !canStartToss} onClick={() => mutate("monster-toss-start", () => submitMonsterTossStart(csrfToken, actionKey("monster-toss-start")), "Opening Monster Toss…")}>{busy === "monster-toss-start" ? "Opening…" : Number(toss.games_remaining || 0) <= 0 ? `Daily reset ${duration(tossResetRemaining)}` : mgp < Number(toss.cost || 20) ? "Not Enough MGP" : `Start Game · ${number(toss.cost || 20)} MGP`}</button>
                </div>
              )}
              <details className="saucer-balance-notes monster-toss-rewards"><summary>Score rewards<DetailsPointer className="saucer-details-pointer" /></summary><div className="monster-toss-payouts">{asObjectArray(toss.payouts).filter((row) => Number(row.minimum_score) > 0).map((row) => <span key={row.tier}><b>{number(row.minimum_score)}+</b> → {number(row.payout)} MGP</span>)}</div></details>
            </div>
          </details>

          <details className="panel saucer-racing-panel saucer-section-disclosure">
            <summary className="saucer-section-summary saucer-race-title-row">
              <div><p className="eyebrow">Alpha 4 Attraction</p><h3>Chocobo Racing</h3></div>
              <span className={`small-badge ${Number(racing.races_remaining || 0) > 0 ? "ready" : "locked"}`}>{number(racing.races_remaining)} / {number(racing.daily_races || 3)} races left</span>
              <DetailsPointer className="saucer-details-pointer" />
            </summary>
            <div className="saucer-race-section-body">
              <div className="saucer-race-hero" aria-hidden="true">
                <img src={`${RACE_ART_ROOT}/hero.webp`} alt="" />
                <div className="saucer-race-hero-shade" />
              </div>
            <p className="muted saucer-race-intro">Race your existing registered Chocobo. Bond level gives a modest performance edge, favored traits help on specific courses, and your pace choice controls race variance.</p>
            {!racing.registered ? (
              <div className="saucer-race-locked">
                <strong>Registered Chocobo Required</strong>
                <span>Visit the Chocobo Stable, complete registration, then return to the Gold Saucer circuit.</span>
              </div>
            ) : (
              <>
                <div className="saucer-race-companion">
                  <img src={`${CHOCOBO_PORTRAIT_ROOT}/${raceCompanion?.portrait_id || "classic_gold"}.webp`} alt={`${displayText(raceCompanion?.name, "Registered Chocobo")} portrait`} />
                  <div><span>Your Racer</span><strong>{displayText(raceCompanion?.name, "Chocobo")}</strong><small>Bond Lv. {number(raceCompanion?.level || 1)}</small></div>
                  <div className="saucer-race-traits">{asArray(raceCompanion?.traits).map((trait) => <span className="small-badge" key={typeof trait === "string" ? trait : trait.id}>{String(typeof trait === "string" ? trait : trait.name || trait.id).replaceAll("_", " ")}</span>)}</div>
                </div>

                {lastRace ? (
                  <div className={`saucer-race-result place-${number(lastRaceDetails.placement || 6)}`}>
                    <div className="saucer-race-result-art">
                      <img src={Number(lastRaceDetails.placement) === 1 ? `${RACE_ART_ROOT}/results/victory.webp` : `${RACE_ART_ROOT}/race-arena.webp`} alt="" aria-hidden="true" />
                      <span>{racePlaceLabel(lastRaceDetails.placement)}</span>
                    </div>
                    <div className="saucer-race-result-copy">
                      <div><span>Last Race</span><strong>{racePlaceLabel(lastRaceDetails.placement)} · {displayText(lastRaceDetails.course_name, "Circuit")}</strong><small>{displayText(lastRaceDetails.strategy_name, "Balanced")} · performance {Number(lastRaceDetails.performance || 0).toFixed(1)}</small></div>
                      <b className={Number(lastRace.payout || 0) > 0 ? "positive" : ""}>{Number(lastRace.payout || 0) > 0 ? `+${number(lastRace.payout)} MGP` : "No podium payout"}</b>
                    </div>
                  </div>
                ) : null}

                <div className="saucer-race-section-head">
                  <div><span className="slot-label">Choose Course</span><small className="muted">Bond level unlocks tougher circuits with larger podium purses.</small></div>
                  <span className="small-badge">6-racer field</span>
                </div>
                <div className="saucer-race-course-grid">
                  {raceCourses.map((course) => (
                    <button type="button" key={course.id} className={`saucer-race-course ${raceCourse === course.id ? "selected" : ""} ${course.eligible ? "" : "locked"}`} onClick={() => setRaceCourse(course.id)} disabled={Boolean(busy)} aria-pressed={raceCourse === course.id}>
                      <span className="saucer-race-course-art"><img src={RACE_COURSE_ART[displayText(course.id, "")] || `${RACE_ART_ROOT}/race-arena.webp`} alt="" aria-hidden="true" /></span>
                      <span className="saucer-race-course-body">
                        <span className="saucer-race-course-meta"><span className={`small-badge ${course.eligible ? "ready" : "locked"}`}>{course.eligible ? `${number(course.cost)} MGP` : `Bond Lv. ${number(course.min_level)}`}</span>{raceCourse === course.id ? <span className="small-badge ready">SELECTED</span> : null}</span>
                        <strong>{displayText(course.name, "Race Course")}</strong>
                        <small>{displayText(course.description, "Gold Saucer race course.")}</small>
                        <span className="saucer-race-podium">{asObjectArray(course.payouts).map((row) => `${row.place}: ${number(row.payout)}`).join(" · ")} MGP</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="saucer-race-section-head">
                  <div><span className="slot-label">Choose Race Pace</span><small className="muted">Steady lowers variance; Final Sprint raises both ceiling and risk.</small></div>
                </div>
                <div className="saucer-race-strategy-grid">
                  {raceStrategies.map((strategy) => (
                    <button type="button" className={`saucer-race-strategy ${raceStrategy === strategy.id ? "selected" : ""}`} key={strategy.id} disabled={Boolean(busy)} onClick={() => setRaceStrategy(strategy.id)} aria-pressed={raceStrategy === strategy.id}>
                      <span className="saucer-race-strategy-art"><img src={RACE_STRATEGY_ART[displayText(strategy.id, "")] || `${RACE_ART_ROOT}/pace/balanced.webp`} alt="" aria-hidden="true" /></span>
                      <span className="saucer-race-strategy-copy"><strong>{displayText(strategy.name, "Race Pace")}</strong><small>{displayText(strategy.description, "Choose a racing pace.")}</small></span>
                    </button>
                  ))}
                </div>

                <div className="saucer-race-entry-strip">
                  <div>
                    <span>Selected Entry</span>
                    <strong>{displayText(selectedRaceCourse?.name, "Circuit")} · {displayText(selectedRaceStrategy?.name, "Balanced")}</strong>
                    <small>{number(selectedRaceCourse?.cost || 0)} MGP · {number(racing.races_remaining)} races remaining today</small>
                  </div>
                  <button type="button" className="equipment-action-button saucer-race-enter" disabled={!actionsAvailable || Boolean(busy) || !raceCanEnter} onClick={() => mutate("chocobo-race", () => submitChocoboRace(selectedRaceCourse?.id, selectedRaceStrategy?.id, csrfToken, actionKey("chocobo-race", `${selectedRaceCourse?.id}-${selectedRaceStrategy?.id}`)), `Entering ${displayText(selectedRaceCourse?.name, "Chocobo Racing")}…`)}>
                    {busy === "chocobo-race" ? "Racing…" : Number(racing.races_remaining || 0) <= 0 ? `Daily reset ${duration(raceResetRemaining)}` : !selectedRaceCourse?.eligible ? `Requires Chocobo Lv. ${number(selectedRaceCourse?.min_level || 1)}` : mgp < Number(selectedRaceCourse?.cost || 0) ? "Not Enough MGP" : `Race Now · ${number(selectedRaceCourse?.cost || 0)} MGP`}
                  </button>
                </div>
              </>
            )}
            </div>
          </details>

          <details className="panel saucer-triad-panel saucer-section-disclosure" defaultOpen={Boolean(triad.active)}>
            <summary className="saucer-section-summary">
              <div><p className="eyebrow">Alpha 5 Attraction</p><h3>Triple Triad</h3></div>
              <span className={`small-badge ${Number(triad.matches_remaining || 0) > 0 ? "ready" : "locked"}`}>{number(triad.matches_remaining)} / {number(triad.daily_matches || 5)} matches left</span>
              <DetailsPointer className="saucer-details-pointer" />
            </summary>
            <div className="saucer-section-body triad-section-body">
              <div className="triad-hero" aria-hidden="true"><ArtImage src={`${TRIAD_ART_ROOT}/ui/hero.webp`} fallbackSrc={TRIAD_ART_FALLBACK} alt="" /><span /></div>
              <p className="muted triad-intro">Build a five-card deck, challenge Gold Saucer opponents, and capture adjacent cards by placing a higher number against a lower opposing side. Alpha 5 uses the clean Open rule only—no Same, Plus, or elemental modifiers.</p>

              {triadMatch?.state === "active" ? (
                <div className="triad-match-live">
                  <div className="triad-match-head">
                    <div><span>Current Match</span><strong>vs {displayText(triadMatchOpponent?.name, "Gold Saucer Opponent")}</strong><small>Your cards {number(triadMatch.player_score)} · Opponent {number(triadMatch.npc_score)}</small></div>
                    <span className="small-badge ready">YOUR TURN</span>
                  </div>
                  <div className="triad-table-layout">
                    <div className="triad-board" aria-label="Triple Triad board">
                      {triadBoard.map((cell, index) => cell ? (
                        <div className={`triad-board-cell occupied owner-${displayId(cell.owner, "player")}`} key={index} aria-label={`Board cell ${index + 1}: ${displayText(cell.card?.name, "card")}, owned by ${displayText(cell.owner, "player")}`}>
                          <TriadCard card={cell.card} owner={cell.owner} compact />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`triad-board-cell empty ${triadSelectedCard ? "playable" : ""}`}
                          key={index}
                          disabled={!actionsAvailable || Boolean(busy) || !triadSelectedCard}
                          onClick={() => mutate(`triad-play-${index}`, () => submitTriadPlay(triadSelectedCard, index, csrfToken, actionKey("triad-play", `${triadSelectedCard}-${index}`)), "Playing Triple Triad card…")}
                          aria-label={triadSelectedCard ? `Play selected card in cell ${index + 1}` : `Empty cell ${index + 1}`}
                        >{triadSelectedCard ? "+" : "·"}</button>
                      ))}
                    </div>
                    <div className="triad-hand-panel">
                      <div className="saucer-race-section-head"><div><span className="slot-label">Your Hand</span><small className="muted">Select a card, then choose an empty board cell.</small></div><span className="triad-hidden-opponent"><ArtImage src={`${TRIAD_ART_ROOT}/cards/card-back.webp`} fallbackSrc={TRIAD_ART_FALLBACK} alt="" aria-hidden="true" /><span className="small-badge">{number(triadMatch.npc_cards_remaining)} hidden opponent cards</span></span></div>
                      <div className="triad-hand-grid">
                        {triadHand.map((card) => <TriadCard key={card.id} card={card} selected={triadSelectedCard === card.id} disabled={Boolean(busy)} onClick={() => setTriadSelectedCard(card.id)} />)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {triadMatch?.state === "resolved" ? (
                    <div className={`triad-last-result result-${triadResultKey}`}>
                      <ArtImage className="triad-result-art" src={`${TRIAD_ART_ROOT}/results/${triadResultKey}.webp`} fallbackSrc={TRIAD_ART_FALLBACK} alt="" aria-hidden="true" />
                      <div className="triad-result-copy"><span>Last Match</span><strong>{String(triadMatch.result || "complete").toUpperCase()} · {number(triadMatch.player_score)}–{number(triadMatch.npc_score)}</strong><small>vs {displayText(triadMatchOpponent?.name, "Gold Saucer Opponent")}</small></div>
                      <span className="small-badge">Match Complete</span>
                    </div>
                  ) : null}

                  <div className="triad-context-banner triad-deck-banner" aria-hidden="true"><ArtImage src={`${TRIAD_ART_ROOT}/ui/deck-builder.webp`} fallbackSrc={TRIAD_ART_FALLBACK} alt="" /><span /></div>
                  <div className="triad-builder-head">
                    <div><span className="slot-label">Deck Builder</span><small className="muted">Choose exactly five owned cards. Your starter deck is granted automatically on first entry.</small></div>
                    <span className={`small-badge ${triadDeckDraft.length === 5 ? "ready" : "locked"}`}>{number(triadDeckDraft.length)} / 5 selected</span>
                  </div>
                  <div className="triad-collection-grid deck-builder" aria-label="Triple Triad deck builder">
                    {triadOwnedCards.map((card) => (
                      <TriadCard
                        key={card.id}
                        card={card}
                        selected={triadDeckDraft.includes(card.id)}
                        disabled={Boolean(busy) || (!triadDeckDraft.includes(card.id) && triadDeckDraft.length >= 5)}
                        onClick={() => setTriadDeckDraft((current) => current.includes(card.id) ? current.filter((id) => id !== card.id) : current.length < 5 ? [...current, card.id] : current)}
                      />
                    ))}
                  </div>
                  <div className="triad-deck-actions">
                    <button type="button" className="equipment-action-button secondary" disabled={!actionsAvailable || Boolean(busy) || triadDeckDraft.length !== 5 || !triadDeckChanged} onClick={() => mutate("triad-save-deck", () => submitTriadSetDeck(triadDeckDraft, csrfToken, actionKey("triad-set-deck")), "Saving Triple Triad deck…")}>{busy === "triad-save-deck" ? "Saving…" : triadDeckChanged ? "Save Deck" : "Deck Saved"}</button>
                  </div>

                  <div className="triad-builder-head triad-opponent-heading">
                    <div><span className="slot-label">Choose Opponent</span><small className="muted">Wins unlock tougher tables, stronger card rewards, and larger MGP purses.</small></div>
                    <span className="small-badge triad-collection-count">{number(triad.owned_count)} / {number(triad.total_cards)} cards collected</span>
                  </div>
                  <div className="triad-opponent-grid">
                    {triadOpponents.map((opponent) => (
                      <button type="button" className={`triad-opponent ${triadOpponent === opponent.id ? "selected" : ""} ${opponent.unlocked ? "" : "locked"}`} key={opponent.id} disabled={Boolean(busy) || !opponent.unlocked} onClick={() => setTriadOpponent(opponent.id)} aria-pressed={triadOpponent === opponent.id}>
                        <span className="triad-opponent-art"><ArtImage src={TRIAD_OPPONENT_ART[displayId(opponent.id, "")] || TRIAD_ART_FALLBACK} fallbackSrc={TRIAD_ART_FALLBACK} alt="" aria-hidden="true" /></span>
                        <span className="triad-opponent-meta"><span className={`small-badge ${opponent.unlocked ? "ready" : "locked"}`}>{opponent.unlocked ? `${number(opponent.cost)} MGP` : `${number(opponent.unlock_wins)} wins`}</span><span className="triad-opponent-status">{triadOpponent === opponent.id && opponent.unlocked ? "SELECTED" : displayText(opponent.difficulty, "Opponent")}</span></span>
                        <strong>{displayText(opponent.name, "Gold Saucer Opponent")}</strong>
                        <span>{displayText(opponent.description, "Triple Triad challenger.")}</span>
                        <small>Win {number(opponent.win_payout)} · Draw {number(opponent.draw_payout)} MGP</small>
                      </button>
                    ))}
                  </div>
                  <div className="triad-entry-strip">
                    <div><span>Selected Match</span><strong>{displayText(selectedTriadOpponent?.name, "Saucer Attendant")}</strong><small>{number(selectedTriadOpponent?.cost || 0)} MGP · {number(triad.matches_remaining)} matches remaining today</small></div>
                    <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !triadCanStart || triadDeckChanged} onClick={() => mutate("triad-start", () => submitTriadStart(selectedTriadOpponent?.id, csrfToken, actionKey("triad-start", selectedTriadOpponent?.id)), `Challenging ${displayText(selectedTriadOpponent?.name, "Triple Triad opponent")}…`)}>
                      {busy === "triad-start" ? "Dealing Cards…" : Number(triad.matches_remaining || 0) <= 0 ? `Daily reset ${duration(triadResetRemaining)}` : triadDeckChanged ? "Save Deck First" : !selectedTriadOpponent?.unlocked ? `Requires ${number(selectedTriadOpponent?.unlock_wins || 0)} Wins` : mgp < Number(selectedTriadOpponent?.cost || 0) ? "Not Enough MGP" : `Start Match · ${number(selectedTriadOpponent?.cost || 0)} MGP`}
                    </button>
                  </div>

                  {Number(triad.owned_count || 0) >= Number(triad.total_cards || 15) ? <div className="triad-context-banner triad-complete-banner"><ArtImage src={`${TRIAD_ART_ROOT}/ui/collection-complete.webp`} fallbackSrc={TRIAD_ART_FALLBACK} alt="Collection complete" /><span /></div> : null}
                  <details className="saucer-balance-notes triad-collection-disclosure">
                    <summary>Card Collection · {number(triad.owned_count)} / {number(triad.total_cards)}<DetailsPointer className="saucer-details-pointer" /></summary>
                    <div className="triad-context-banner triad-collection-banner" aria-hidden="true"><ArtImage src={`${TRIAD_ART_ROOT}/ui/collection.webp`} fallbackSrc={TRIAD_ART_FALLBACK} alt="" /><span /></div>
                    <div className="triad-collection-grid collection-view">
                      {triadCollection.map((card) => card.owned ? <TriadCard key={card.id} card={card} compact /> : <div className="triad-card full-face locked compact" key={card.id} role="img" aria-label="Locked Triple Triad card"><span className="triad-card-art" aria-hidden="true"><ArtImage src={`${TRIAD_ART_ROOT}/cards/card-back.webp`} fallbackSrc={TRIAD_ART_FALLBACK} alt="" /></span><span className="triad-card-lock">Locked</span></div>)}
                    </div>
                  </details>
                </>
              )}
            </div>
          </details>

          <details className="panel saucer-prize-panel saucer-scenic-panel saucer-section-disclosure">
            <summary className="saucer-section-summary">
              <div><p className="eyebrow">Cosmetic Rewards</p><h3>Prize Counter</h3></div>
              <span className="small-badge">Titles Only · Alpha 5</span>
              <DetailsPointer className="saucer-details-pointer" />
            </summary>
            <img className="saucer-scenic-art saucer-prize-art" src={`${SAUCER_ART_ROOT}/prize-counter.webp`} alt="" aria-hidden="true" />
            <div className="saucer-section-body">
            <p className="muted">Spend MGP on collectible titles. Gold Saucer prizes are cosmetic only and never grant combat stats, Gil, items, or progression advantages.</p>
            <div className="saucer-prize-grid">
              {prizes.map((prize) => (
                <article className={`saucer-prize-card ${prize.owned ? "owned" : ""}`} key={prize.id}>
                  <div>
                    <span className={`small-badge ${prize.owned ? "ready" : ""}`}>{prize.owned ? "OWNED" : `${number(prize.cost)} MGP`}</span>
                    <h4>{displayText(prize.name, "Gold Saucer Prize")}</h4>
                    <p className="muted">{displayText(prize.description, "Cosmetic Gold Saucer reward.")}</p>
                  </div>
                  <button
                    type="button"
                    className="equipment-action-button secondary"
                    disabled={!actionsAvailable || Boolean(busy) || prize.owned || mgp < Number(prize.cost || 0)}
                    onClick={() => mutate(`prize-${prize.id}`, () => submitSaucerBuy(prize.id, csrfToken, actionKey("saucer-buy", prize.id)), `Claiming ${displayText(prize.name, "Gold Saucer prize")}…`)}
                  >{prize.owned ? "Collected" : mgp < Number(prize.cost || 0) ? "Not Enough MGP" : `Unlock · ${number(prize.cost)} MGP`}</button>
                </article>
              ))}
            </div>
            <p className="saucer-instruction">Next daily floor allowance in {duration(nextAllowanceRemaining)}. Your first-day welcome purse replaces the allowance for that day.</p>
            </div>
          </details>

          <details className="panel saucer-records-panel saucer-section-disclosure">
            <summary className="saucer-section-summary"><div><p className="eyebrow">Personal Records</p><h3>Saucer Ledger</h3></div><span className="small-badge">v1.6.0</span><DetailsPointer className="saucer-details-pointer" /></summary>
            <div className="saucer-section-body">
            <div className="saucer-record-grid">
              <div><span>Current Net MGP</span><strong>{netMgp >= 0 ? "+" : ""}{number(netMgp)} MGP</strong></div>
              <div><span>Games Played</span><strong>{number(records.games_played)}</strong></div>
              <div><span>Prizes Collected</span><strong>{number(account.prizes_bought)}</strong></div>
              <div><span>Cactpot Tickets</span><strong>{number(account.cactpot_plays)}</strong></div>
              <div><span>Cactpot W / D / L</span><strong>{number(records.cactpot_net_wins)} / {number(records.cactpot_draws)} / {number(records.cactpot_losses)}</strong></div>
              <div><span>Best Cactpot</span><strong>{number(account.cactpot_best_payout)} MGP</strong></div>
              <div><span>Cactpot High Rolls</span><strong>{number(records.cactpot_high_rolls)}</strong></div>
              <div><span>Slot Spins</span><strong>{number(account.slots_spins)}</strong></div>
              <div><span>Slot Win Rate</span><strong>{Number(records.slots_win_rate_pct || 0).toFixed(1)}%</strong></div>
              <div><span>Triple Matches</span><strong>{number(records.slots_triples)}</strong></div>
              <div><span>Best Slots</span><strong>{number(account.slots_best_payout)} MGP</strong></div>
              <div><span>Monster Toss Games</span><strong>{number(records.monster_toss_games)}</strong></div>
              <div><span>Best Toss Score</span><strong>{number(records.monster_toss_best_score)}</strong></div>
              <div><span>Toss Accuracy</span><strong>{Number(records.monster_toss_accuracy_pct || 0).toFixed(1)}%</strong></div>
              <div><span>Best Toss Payout</span><strong>{number(records.monster_toss_best_payout)} MGP</strong></div>
              <div><span>Chocobo Races</span><strong>{number(records.chocobo_races)}</strong></div>
              <div><span>Race Wins</span><strong>{number(records.chocobo_race_wins)}</strong></div>
              <div><span>Race Podiums</span><strong>{number(records.chocobo_race_podiums)}</strong></div>
              <div><span>Race Win Rate</span><strong>{Number(records.chocobo_race_win_rate_pct || 0).toFixed(1)}%</strong></div>
              <div><span>Best Race Finish</span><strong>{records.chocobo_race_best_finish ? `#${number(records.chocobo_race_best_finish)}` : "—"}</strong></div>
              <div><span>Best Race Payout</span><strong>{number(records.chocobo_race_best_payout)} MGP</strong></div>
              <div><span>Triad Matches</span><strong>{number(records.triple_triad_matches)}</strong></div>
              <div><span>Triad Wins</span><strong>{number(records.triple_triad_wins)}</strong></div>
              <div><span>Triad Win Rate</span><strong>{Number(records.triple_triad_win_rate_pct || 0).toFixed(1)}%</strong></div>
              <div><span>Triad Cards</span><strong>{number(records.triple_triad_cards_owned)} / {number(triad.total_cards)}</strong></div>
              <div><span>Cards Won</span><strong>{number(records.triple_triad_cards_won)}</strong></div>
              <div><span>Best Triad Streak</span><strong>{number(records.triple_triad_best_streak)}</strong></div>
              <div><span>Lifetime Earned</span><strong>{number(account.lifetime_earned)} MGP</strong></div>
              <div><span>Lifetime Spent</span><strong>{number(account.lifetime_spent)} MGP</strong></div>
            </div>
            <details className="saucer-balance-notes">
              <summary>Balance details<DetailsPointer className="saucer-details-pointer" /></summary>
              <p className="muted">Mini Cactpot now records net wins, draws, and losses against its 10 MGP ticket price. Your realized slot return is <b>{Number(records.slots_realized_return_pct || 0).toFixed(1)}%</b>; the current long-run slot payout target is about <b>{Number(balance.slots_theoretical_return_pct || 87.5).toFixed(1)}%</b>. Short sessions can vary dramatically.</p>
            </details>
            </div>
          </details>

          <details className="panel saucer-history-panel saucer-disclosure saucer-section-disclosure">
            <summary className="saucer-section-summary"><span><span className="eyebrow">Recent Activity</span><strong>Last Eight Entries</strong></span><span className="small-badge">{number(history.length)}</span><DetailsPointer className="saucer-details-pointer" /></summary>
            {history.length ? (
              <div className="saucer-history-list">
                {history.map((entry, index) => {
                  const game = String(entry.game || "activity").replaceAll("_", " ");
                  const details = asRecord(entry.details);
                  const label = entry.game === "prize" ? String(details.name || entry.outcome || "Prize") : entry.game === "daily_allowance" ? "Daily floor allowance" : entry.game === "welcome" ? "Welcome purse" : entry.game === "monster_toss" ? `Monster Toss · ${number(details.score || 0)} pts` : entry.game === "chocobo_racing" ? `Chocobo Racing · ${details.course_name || "Circuit"}` : entry.game === "triple_triad" ? `Triple Triad · ${details.opponent_name || "Match"}` : game;
                  return <div className="saucer-history-row" key={`${entry.created_at || 0}-${index}`}>
                    <span><strong>{label}</strong><small>{entry.game === "slots" && Array.isArray(details.labels) ? details.labels.join(" · ") : entry.game === "monster_toss" ? `${number(details.hits || 0)} / ${number(details.throws || 0)} hits · ${String(entry.outcome || "").replaceAll("_", " ")}` : entry.game === "chocobo_racing" ? `${details.chocobo_name || "Chocobo"} · ${details.strategy_name || "Balanced"} · place ${number(details.placement || 0)}` : entry.game === "triple_triad" ? `${number(details.player_score)}–${number(details.npc_score)}${details.card_reward_name ? ` · won ${details.card_reward_name}` : ""}` : String(entry.outcome || "").replaceAll("_", " ")}</small></span>
                    <b className={Number(entry.payout || 0) > Number(entry.wager || 0) ? "positive" : ""}>{Number(entry.payout || 0) > 0 ? `+${number(entry.payout)} MGP` : Number(entry.wager || 0) > 0 ? `−${number(entry.wager)} MGP` : "—"}</b>
                  </div>;
                })}
              </div>
            ) : <p className="muted">No Gold Saucer activity recorded yet.</p>}
          </details>

          {futureAttractions.length ? (
            <details className="panel saucer-attractions-panel saucer-section-disclosure">
              <summary className="saucer-section-summary"><div><p className="eyebrow">Coming Next</p><h3>Future Attractions</h3></div><span className="small-badge">{number(futureAttractions.length)}</span><DetailsPointer className="saucer-details-pointer" /></summary>
              <div className="saucer-section-body saucer-attraction-grid future-only">
                {futureAttractions.map((attraction) => (
                  <article className={`saucer-attraction ${displayId(attraction.status, "coming-soon")}`} key={displayText(attraction.id, `future-${displayText(attraction.name, "attraction")}`)}>
                    <span className="small-badge locked">COMING SOON</span>
                    <h4>{displayText(attraction.name, "Future Attraction")}</h4>
                    <p className="muted">{displayText(attraction.description, "Coming soon to the Gold Saucer.")}</p>
                  </article>
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}
    </section>
  );
}
