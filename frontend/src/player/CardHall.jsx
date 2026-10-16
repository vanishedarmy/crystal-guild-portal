import { useEffect, useRef, useState } from "react";
import { getJson } from "../api/client.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import "../styles/card-hall.css";
import CorrespondenceLobby, { DuelStatus } from "./CorrespondenceLobby.jsx";
import CardPortrait, { CardArtDialog } from "./CardPortrait.jsx";
import { Collection, DeckBuilder, SoloCircuit } from "./CardHallLibrary.jsx";

function Pattern({ card }) {
  return <span className="qb-pattern" role="img" aria-label={`Territory pattern: ${card.claim.map(([r, c]) => `${Math.abs(r)} ${r < 0 ? "up" : r > 0 ? "down" : "vertical"}, ${c} forward`).join("; ")}`}>
    {Array.from({ length: 25 }, (_, i) => {
      const r = Math.floor(i / 5) - 2, c = i % 5 - 2;
      const effect = (card.effect_offsets || (card.effect ? [[-1, 0], [1, 0]] : [])).some(([dr, dc]) => dr === r && dc === c);
      return <i key={i} className={`${r === 0 && c === 0 ? "origin" : card.claim.some(([dr, dc]) => dr === r && dc === c) ? "claimed" : ""} ${effect ? card.amount < 0 ? "effect enfeeble" : "effect" : ""}`} />;
    })}
  </span>;
}

function effectSummary(events, cards) {
  const groups = new Map();
  for (const event of events) {
    const key = `${event.row}:${event.col}:${event.card}`;
    const group = groups.get(key) || { ...event, amount: 0, kinds: [] };
    group.amount += event.amount || 0; group.kinds.push(event.kind); groups.set(key, group);
  }
  return [...groups.values()].map(event => {
    const result = event.kinds.includes("destroyed") ? "destroyed" : event.kinds.includes("replaced") ? "replaced and removed" : event.kinds.includes("replacement") ? "placed as replacement" : event.kinds.includes("threshold") ? "threshold fired" : event.kinds.includes("scaling") ? "count bonus changed" : "power changed";
    const delta = event.amount ? ` (${event.amount > 0 ? "+" : "−"}${Math.abs(event.amount)} power)` : "";
    return `${cards[event.card]?.name || event.card}: ${result}${delta} · lane ${event.row + 1}, column ${event.col + 1}`;
  });
}

function Lesson({ match, cards }) {
  const tiles = match.board.flat();
  const checks = [
    ["Place a card", tiles.some(t => t.card && t.owner === 0)],
    ["Expand beyond your home edge", match.board.some(row => row.slice(1).some(t => t.owner === 0))],
    ["Build a rank-2 position", tiles.some(t => !t.card && t.owner === 0 && t.rank >= 2)],
    ["Enhance an ally", tiles.some(t => t.card && t.owner === 0 && t.power > cards[t.card].power)],
  ];
  const text = match.phase === "mulligan"
    ? "Start with five cards. Select any you want to exchange, or keep them all. You get one opening exchange."
    : match.phase === "finished"
      ? "Compare each lane. Only its winner receives their lane power; a tied lane awards neither side points."
      : !match.legal.length
        ? "No card in your hand fits a controlled empty position. Pass to let the Opponent move; two consecutive passes end the match."
        : match.mode !== "tutorial"
          ? "Preview the complete board before confirming. Replacement cards need an allied occupied position; enfeeblement can remove cards and start a chain when ongoing boosts disappear."
        : match.ply < 2
          ? "Try Chocobo in the middle of your home edge. Its pattern opens a position forward and strengthens positions above and below."
          : match.ply < 6
            ? "Yellow previews show claimed positions. Reaching an enemy pawn position changes its ownership without reducing its rank. Occupied cards cannot be captured this way."
            : "Rank is the pawn requirement; power contributes to a lane. Use Moogle beside allies for an ongoing boost, or play White Mage beside existing allies for a one-time boost.";
  return <aside className="qb-lesson" aria-label="Moogle Dealer tutorial">
    <strong>{match.mode === "tutorial" ? "Moogle Dealer · Guided lesson" : "Practice reminders"}</strong>
    <p>{text}</p>
    {match.mode === "tutorial" && <ul>{checks.map(([label, done]) => <li key={label}>{done ? "✓" : "○"} {label}</li>)}</ul>}
  </aside>;
}

export default function CardHall({ overview }) {
  const { auth } = usePortalAuth();
  const own = Boolean(auth.authenticated && auth.player?.username &&
    auth.player.username.toLowerCase() === String(overview?.identity?.username || "").toLowerCase());
  const [section, setSection] = useState("play");
  const [snapshot, setSnapshot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [position, setPosition] = useState(null);
  const [exchange, setExchange] = useState([]);
  const [inspected, setInspected] = useState(null);
  const [confirmResign, setConfirmResign] = useState(false);
  const [failed, setFailed] = useState(null);
  const inFlight = useRef(false);
  const generation = useRef(0);
  const [duels, setDuels] = useState(null);
  const [duelId, setDuelId] = useState(null);
  const [connection, setConnection] = useState("connecting");
  const [artCard, setArtCard] = useState(null);
  const pvp = section === "pvp";
  const currentDuel = duels?.matches.find(m => m.id === duelId);
  const match = pvp ? currentDuel?.match : snapshot?.match;
  const cards = Object.fromEntries([...(snapshot?.cards || []), ...(snapshot?.match_cards || []), ...(pvp ? currentDuel?.cards || [] : [])].map(c => [c.id, c]));

  useEffect(() => {
    const controller = new AbortController();
    const current = ++generation.current;
    setSnapshot(null); setSection("play"); setError(""); setSelected(null); setPosition(null);
    setExchange([]); setInspected(null); setFailed(null); setConfirmResign(false);
    setDuels(null); setDuelId(null); setConnection("connecting"); setArtCard(null);
    if (own) getJson("/api/card-hall", { signal: controller.signal })
      .then(value => { if (generation.current === current) setSnapshot(value); })
      .catch(e => { if (e.name !== "AbortError" && generation.current === current) setError(e.message); });
    return () => { controller.abort(); generation.current++; };
  }, [own, overview?.identity?.username]);

  useEffect(() => {
    if (!own || !pvp) return;
    let cancelled = false, sequence = 0, polling = false;
    const poll = async () => {
      if (inFlight.current || polling || document.hidden) return;
      if (!navigator.onLine) { setConnection("offline"); return; }
      polling = true;
      const request = ++sequence, started = generation.current;
      try {
        const value = await getJson("/api/card-hall/pvp");
        if (!cancelled && request === sequence && !inFlight.current && started === generation.current) {
          setDuels({ ...value, received_at: Date.now() }); setConnection("connected");
        }
      } catch { if (!cancelled && started === generation.current) setConnection(navigator.onLine ? "reconnecting" : "offline"); }
      finally { polling = false; }
    };
    const offline = () => setConnection("offline");
    poll(); const timer = setInterval(poll, currentDuel?.mode === "live" ? 3000 : 10000);
    window.addEventListener("online", poll); window.addEventListener("offline", offline);
    window.addEventListener("focus", poll); document.addEventListener("visibilitychange", poll);
    return () => { cancelled = true; clearInterval(timer); window.removeEventListener("online", poll);
      window.removeEventListener("offline", offline); window.removeEventListener("focus", poll);
      document.removeEventListener("visibilitychange", poll); };
  }, [own, pvp, currentDuel?.mode]);
  useEffect(() => { setSelected(null); setPosition(null); setExchange([]); setInspected(null); setConfirmResign(false); setFailed(null); }, [section, duelId, match?.revision]);

  async function duelSend(action, item = currentDuel) {
    return send(action, null, item);
  }

  async function refresh() {
    if (inFlight.current) return;
    setBusy(true); setError("");
    inFlight.current = true;
    const current = ++generation.current;
    try {
      const value = await getJson(pvp ? "/api/card-hall/pvp" : "/api/card-hall");
      if (generation.current === current) { if (pvp) { setDuels({ ...value, received_at: Date.now() }); setConnection("connected"); } else setSnapshot(value); setFailed(null); setSelected(null); setPosition(null); }
    } catch (e) { if (generation.current === current) setError(e.message); }
    finally { inFlight.current = false; setBusy(false); }
  }

  async function send(action, retry = null, duel = currentDuel) {
    if (inFlight.current || !own || !snapshot?.play_enabled) return;
    const request = retry || {
      key: `qb:${globalThis.crypto.randomUUID()}`,
      payload: { match_id: pvp ? duel?.id || null : match?.id || null, revision: pvp ? duel?.revision || 0 : match?.revision || 0, action: action?.kind === "start" ? { ...action, profile_revision: snapshot.profile.revision } : action },
    };
    inFlight.current = true; setBusy(true); setError("");
    const current = ++generation.current;
    try {
      const value = await getJson(pvp ? "/api/card-hall/pvp" : "/api/card-hall", {
        method: "POST", headers: { "Content-Type": "application/json", "X-Crystal-Guild-CSRF": auth.csrf_token || "", "Idempotency-Key": request.key },
        body: JSON.stringify(request.payload),
      });
      if (generation.current !== current) return;
      if (pvp) { setDuels({ ...value, received_at: Date.now() }); setConnection("connected"); } else setSnapshot(value); setSelected(null); setPosition(null); setExchange([]);
      setFailed(null); setConfirmResign(false); setInspected(null);
      if (action?.kind === "start") setSection("play");
      return value;
    } catch (e) {
      if (generation.current !== current) return;
      setError(e.message); setFailed(request);
      // Recover a committed move after a lost response without applying it twice.
      try {
        const value = await getJson(pvp ? "/api/card-hall/pvp" : "/api/card-hall");
        if (generation.current === current) {
          if (pvp) { setDuels({ ...value, received_at: Date.now() }); setConnection("connected"); } else setSnapshot(value); setSelected(null); setPosition(null);
          if (pvp || value.match?.id !== request.payload.match_id || value.match?.revision !== request.payload.revision || (request.payload.action.profile_revision !== undefined && value.profile?.revision !== request.payload.action.profile_revision)) {
            setFailed(null); setExchange([]); setConfirmResign(false);
            setError(`${e.message} Latest saved match loaded.`);
          }
        }
      } catch { /* Keep the exact request key for an explicit retry. */ }
      return null;
    } finally { inFlight.current = false; setBusy(false); }
  }

  const selectedCard = selected === null ? null : cards[match?.hand[selected]];
  const choices = (match?.legal || []).filter(m => m.hand === selected);
  const preview = choices.find(m => m.row === position?.row && m.col === position?.col);
  const detail = inspected ? cards[inspected] : selectedCard;
  const disabled = busy || !snapshot?.play_enabled || Boolean(failed) || (pvp && connection !== "connected");
  const turnDisabled = disabled || (pvp && (match?.phase === "mulligan" ? match.opening_confirmed : !match?.your_turn));
  function hint() {
    const moves = match?.legal || [];
    const move = moves.find(m => match.hand[m.hand] === "QB001" && m.row === 1 && m.col === 0) || moves[0];
    if (move) { setSelected(move.hand); setPosition({ row: move.row, col: move.col }); setInspected(null); }
  }

  return <section className="panel qb-hall" aria-label="Queen’s Blood Card Hall">
    <div className="qb-heading"><div><p className="eyebrow">Crystal Guild · Card Hall</p><h2>Queen’s Blood</h2></div><span className="small-badge">48 illustrated cards · v1.9.7</span></div>
    <p className="qb-intro">Claim territory across three lanes with an illustrated Final Fantasy roster. Learn solo, build a deck, or challenge another adventurer.</p>
    <details className="qb-rules"><summary>How to play</summary>
      <ol><li>Choose a card and a controlled empty position with enough pawns. Replacement cards instead use an allied occupied position.</li><li>Preview its territory and power changes, then confirm. Each turn plays one card or passes.</li><li>More pawns unlock higher-rank cards. Claiming an opponent’s pawn position keeps its rank.</li><li>Only the winner of a lane scores their lane power. Tied lanes score zero; the highest combined score wins.</li><li>Passing is temporary. Two consecutive passes end the match. Cards remaining in hand score nothing.</li></ol>
      <p>Moogle boosts neighboring allies while present. White Mage boosts only allies already above and below when played.</p>
      <p>Enfeeblement reduces power. At zero or below, a card is destroyed and leaves a rank-1 position for its owner. Ongoing effects stop when their source leaves; losing a boost can cause further destruction. Replacement cards go on an allied card without a pawn requirement. Bomb also triggers when replaced. Noctis and Ultimecia inherit printed power, rather than temporary boosts.</p>
      <p>Onion Knight first reaching 4 power and Cloud first reaching 6 power each fire one boost per card on the board. ★ means the threshold has fired; ○ means it is still available. A later power drop does not reset it.</p>
      <p>↑ and ↓ mark net enhancement and enfeeblement from other cards. Flan counts other enhanced allies; Ahriman and Exdeath count enfeebled enemies. Own count bonuses and inherited printed power do not create these statuses; equal boosts and reductions cancel. Destroyed cards stop contributing immediately.</p>
      <p>Advanced resolution: replacement removal and its destruction chain, the new card’s played ability, further destruction and once-only threshold chains, then territory claims. Destruction resolves before checking surviving thresholds. Cards reaching zero together are removed together. A newly emptied position in the played card’s claim pattern can be captured. The preview shows the complete result before the opponent moves.</p>
      <p>Crystal Guild rules: 15-card decks, five opening cards, one opening exchange. Draw one each turn after the first turn of the match, including after a pass; an empty deck has no penalty. Exchanged cards return to the deck after replacements are drawn. These original cards use the Guild’s resolution and status rules described above. Existing saved matches keep the rules and cards they started with.</p>
    </details>
    {!own ? <p className="state-message">Sign in and open your own adventurer profile to play. Matches are private to their owner.</p> : <>
      {error && <div className="qb-error" role="alert">{error} <button type="button" onClick={failed ? () => send(null, failed) : refresh} disabled={busy}>{failed ? "Retry same request" : "Reload match"}</button>{failed && <button type="button" disabled={busy} onClick={refresh}>Reload latest state</button>}</div>}
      {!snapshot && !error && <p role="status">Loading your saved match…</p>}
      {snapshot && <>
        {!snapshot.play_enabled && <p className="state-message">Play is disabled by the Portal administrator. Your saved match remains available to view.</p>}
        <nav className="qb-sections" aria-label="Card Hall sections">{[["play", "Play"], ["circuit", "Solo Circuit"], ["pvp", "Player Duels"], ["decks", "Decks"], ["collection", "Collection"]].map(([id, label]) => <button type="button" key={id} aria-pressed={section === id} onClick={() => setSection(id)}>{label}</button>)}</nav>
        <div hidden={!pvp}><p className={`qb-connection ${connection}`} role="status">{connection === "connected" ? "Connected · turns save automatically" : connection === "offline" ? "Offline · reconnect to continue. Live clocks keep running." : connection === "reconnecting" ? "Reconnecting… saved turns will reload. Live clocks keep running." : "Connecting to your saved duels…"}</p><CorrespondenceLobby snapshot={duels} selected={duelId} choose={setDuelId} send={duelSend} refresh={refresh} disabled={disabled} /></div>
        <div hidden={section !== "play" && !pvp}>
        {!pvp && (!match || match.phase === "finished") && <div className="qb-start-actions">
          <button type="button" disabled={turnDisabled} onClick={() => send({ kind: "start", mode: "tutorial" })}>Start guided tutorial</button>
          <button type="button" disabled={turnDisabled} onClick={() => send({ kind: "start", mode: "practice" })}>Play practice match</button>
        </div>}
        {match && <>
          <div className="qb-match-meta"><strong>{match.mode === "tutorial" ? "Guided opening · prepared deal" : `${pvp ? `Duel with ${match.opponent_name}` : match.mode === "circuit" ? match.opponent_name : "Practice"} · ${match.deck_name}`}</strong><span>{match.opponent_name} hand: {match.opponent_hand_count} · Decks: you {match.deck_counts[0]} / Opponent {match.deck_counts[1]}</span><button type="button" onClick={refresh} disabled={busy}>Reload saved match</button></div>
          {!pvp && <Lesson match={match} cards={cards} />}
          {pvp && <DuelStatus match={match} snapshot={duels} />}
          {match.phase === "finished" && <div className="qb-result" role="status"><strong>{match.winner === null ? "Draw" : match.winner === 0 ? "You win" : `${match.opponent_name} wins`}</strong><span>{match.scores.totals[0]} – {match.scores.totals[1]}{match.reason === "resigned" ? " · Match resigned" : match.reason === "timeout" ? " · Turn deadline missed" : " · Two consecutive passes"}</span><p>{match.reward_cards?.length ? `First-win cards unlocked: ${match.reward_cards.map(id => cards[id].name).join(", ")}.` : pvp ? "Casual duel recorded. All card unlocks remain available through solo play." : match.mode === "circuit" ? "First victories unlock cards; rematches do not grant duplicates." : "Tutorial and practice matches do not grant circuit unlocks."}</p></div>}
          <div className="qb-scoreboard" aria-label="Current awarded scores"><strong>You <b>{(preview?.scores || match.scores).totals[0]}</b></strong><span>{preview ? "Placement preview · before opponent moves" : "Awarded score if play ends now"}</span><strong>Opponent <b>{(preview?.scores || match.scores).totals[1]}</b></strong></div>
          <div className="qb-board" aria-label="Three-lane card board">
            {match.board.map((row, r) => <div className="qb-lane" key={r}>
              <div className="qb-lane-score"><span>Lane {r + 1}</span><strong>You {(preview?.scores || match.scores).lanes[r].power[0]} · Opponent {(preview?.scores || match.scores).lanes[r].power[1]}</strong></div>
              <div className="qb-tiles">{row.map((tile, c) => {
                const legal = choices.some(m => m.row === r && m.col === c);
                const claimed = preview?.claims.some(([rr, cc]) => rr === r && cc === c) && !tile.card;
                const chosen = position?.row === r && position?.col === c;
                const originalCard = cards[tile.card];
                const shownTile = preview?.board?.[r]?.[c] || tile;
                const card = cards[shownTile.card];
                const shownCard = preview?.board ? card : chosen && preview ? selectedCard : card;
                const removed = Boolean(originalCard && !shownCard);
                const replaced = Boolean(originalCard && shownCard && originalCard.id !== shownCard.id);
                const territory = preview?.territory.find(t => t.row === r && t.col === c);
                const shownOwner = shownTile.owner;
                const shownRank = shownTile.rank;
                const power = preview?.powers[r][c] ?? tile.power;
                const statusText = shownTile.status === "enhanced" ? "enhanced" : shownTile.status === "enfeebled" ? "enfeebled" : "";
                const thresholdText = shownCard?.effect === "threshold" ? shownTile.threshold_fired ? "threshold already fired" : `threshold available at ${shownCard.threshold} power` : "";
                return <button type="button" key={c} className={`qb-tile ${shownOwner === 0 ? "ally" : shownOwner === 1 ? "enemy" : "neutral"} ${legal ? "legal" : ""} ${claimed ? "claim-preview" : ""} ${chosen ? "chosen" : ""} ${removed ? "removal-preview" : ""}`}
                  aria-label={`Lane ${r + 1}, column ${c + 1}: ${statusText ? `${statusText}; ` : ""}${thresholdText ? `${thresholdText}; ` : ""} ${removed ? `Preview: ${originalCard.name} destroyed; ` : replaced ? `Preview: ${originalCard.name} replaced; ` : ""}${chosen && preview && shownCard ? `Preview ${selectedCard.name}, power ${power}; ` : ""}${card ? `${card.name}, power ${power}, ${shownOwner === 0 ? "yours" : "Opponent’s"}` : `${shownOwner === 0 ? "your" : shownOwner === 1 ? "Opponent’s" : "unclaimed"} position, rank ${shownRank}${legal ? ", legal placement" : ""}${territory ? ", territory preview" : ""}`}`}
                  aria-pressed={chosen} disabled={busy || (!originalCard && (!legal || turnDisabled))}
                  onClick={() => legal && !turnDisabled ? (setPosition({ row: r, col: c }), setInspected(null)) : originalCard && setInspected(originalCard.id)}>
                  {shownCard && (statusText || thresholdText) && <span className="qb-status-mark" aria-hidden="true" title={[statusText, thresholdText].filter(Boolean).join(" · ")}>{shownTile.status === "enhanced" ? "↑" : shownTile.status === "enfeebled" ? "↓" : ""}{shownCard.effect === "threshold" ? shownTile.threshold_fired ? "★" : "○" : ""}</span>}
                  {shownCard ? <><CardPortrait card={shownCard} className="qb-board-portrait" eager /><b>{power}</b><span className="qb-tile-name">{shownCard.name}</span></> : <><span aria-hidden="true">{shownRank ? "●".repeat(shownRank) : "·"}</span><small>{removed ? "Removed" : shownOwner === 0 ? "You" : shownOwner === 1 ? "Opponent" : "Open"}</small></>}
                </button>;
              })}</div>
            </div>)}
          </div>
          {["mulligan", "play"].includes(match.phase) && <>
            <h3>{match.phase === "mulligan" ? "Choose your opening exchange" : "Your hand"}</h3>
            <div className="qb-hand" aria-label="Your cards">{match.hand.map((id, i) => {
              const card = cards[id], marked = match.phase === "mulligan" ? exchange.includes(i) : selected === i;
              return <button type="button" className={`qb-hand-card ${marked ? "selected" : ""}`} key={`${id}:${i}`} aria-pressed={marked} disabled={turnDisabled}
                onClick={() => { setInspected(null); setPosition(null); if (match.phase === "mulligan") { setInspected(id); setExchange(v => v.includes(i) ? v.filter(x => x !== i) : [...v, i]); } else setSelected(i); }}>
                <CardPortrait card={card} className="qb-hand-portrait" eager /><strong>{card.name}</strong><span className="qb-hand-meta"><span className="qb-card-values">{card.rank === "Replace" ? "Replace ally" : `Rank ${card.rank}`}<br />Power {card.power}</span><Pattern card={card} /></span>{match.phase === "mulligan" && marked && <small>Exchange selected</small>}
              </button>;
            })}</div>
            {match.phase === "mulligan" ? <button type="button" className="qb-confirm" disabled={turnDisabled} onClick={() => send({ kind: "mulligan", indices: exchange })}>{exchange.length ? `Exchange ${exchange.length} and begin` : "Keep hand and begin"}</button> : <div className="qb-turn-actions">
              <button type="button" className="qb-confirm" disabled={turnDisabled || !preview} onClick={() => send({ kind: "play", hand: selected, row: position.row, col: position.col })}>{preview ? `Confirm ${selectedCard.name} · lane ${position.row + 1}` : "Select a card and a legal position"}</button>
              <button type="button" disabled={turnDisabled || !match.legal.length} onClick={hint}>Show a legal move</button>
              <button type="button" disabled={turnDisabled} onClick={() => send({ kind: "pass" })}>{match.passes ? "Pass · ends the match" : "Pass turn"}</button>
            </div>}
          </>}
          {preview?.events?.length > 0 && <aside className="qb-effect-preview" aria-label="Placement effects"><strong>Placement effects</strong><ul>{effectSummary(preview.events, cards).map((line, i) => <li key={i}>{line}</li>)}</ul></aside>}
          {detail && <aside className="qb-card-detail" aria-label="Selected card details"><button type="button" className="qb-art-button" aria-label={`View ${detail.name} artwork`} onClick={() => setArtCard(detail)}><CardPortrait card={detail} eager /></button><div className="qb-detail-copy"><strong>{detail.name}</strong><span>{detail.reference} · {detail.rank === "Replace" ? "Replacement" : `Rank ${detail.rank}`} · Printed power {detail.power}</span><p>{detail.rules}</p></div><Pattern card={detail} /></aside>}
          {["mulligan", "play"].includes(match.phase) && <div className="qb-resign">{confirmResign ? <><span>End this match as a loss?</span><button type="button" disabled={disabled} onClick={() => send({ kind: "resign" })}>Confirm resignation</button><button type="button" disabled={busy} onClick={() => setConfirmResign(false)}>Keep playing</button></> : <button type="button" disabled={disabled} onClick={() => setConfirmResign(true)}>Resign match</button>}</div>}
          <details className="qb-history"><summary>Recent moves</summary>{match.events?.length > 0 && <p>Last move removed: {match.events.filter(e => ["destroyed", "replaced"].includes(e.kind)).map(e => cards[e.card]?.name || e.card).join(", ") || "no cards"}.</p>}<ol>{match.log.map((line, i) => <li key={i}>{line}</li>)}</ol></details>
        </>}
        </div>
        <div hidden={section !== "circuit"}><SoloCircuit snapshot={snapshot} send={send} disabled={turnDisabled} /></div>
        <div hidden={section !== "decks"}><DeckBuilder snapshot={snapshot} send={send} disabled={turnDisabled} /></div>
        <div hidden={section !== "collection"}><Collection snapshot={snapshot} Pattern={Pattern} /></div>
        <p className="qb-footnote">Your match saves after every turn. All 48 illustrated cards unlock through solo play. Live duels allow 90 seconds per turn; correspondence duels allow 48 hours. The Portal must be running to play; the Bot can be offline.</p>
      </>}
    </>}
    {busy && <p className="qb-busy" role="status">Saving your move…</p>}
    {artCard && <CardArtDialog card={artCard} close={() => setArtCard(null)} />}
  </section>;
}
