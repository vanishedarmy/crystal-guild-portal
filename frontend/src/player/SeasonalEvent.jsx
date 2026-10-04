import { useEffect, useMemo, useRef, useState } from "react";
import { submitSeasonalBuy, submitSeasonalState, waitForPortalAction } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { number } from "../utils/formatters.js";
import { humanizeLabel } from "../utils/displayLabels.js";

const REWARD_DESCRIPTIONS = {
  spooky_supply_cache: "Adds one sealed cache to Inventory. Open for one reward: 45% common, 25% uncommon, 10% rare, 4% artifact, 1% legendary item, or 15% chance of 100–750 Gil.",
  nightwatcher: "Unlocks the Nightwatcher title for your adventurer. Cosmetic only; no stat bonus.",
  haunted_candle: "A Halloween keepsake for your seasonal collection. Cosmetic only; no stat bonus.",
  hollow_crystal_display: "A seasonal display collectible that also unlocks the Keeper of the Hollow trophy. No stat bonus.",
};

const HALLOWEEN_ART = "/seasonal/halloween-2026/";
const ART_REVISION = "halloween-art-hotfix3";
const SCENES = [
  { name: "Haunted Ruins", file: "haunted-ruins.webp" },
  { name: "Graveyard", file: "graveyard.webp" },
  { name: "Eerie Forest", file: "eerie-forest.webp" },
  { name: "Hollow Crystal Spire", file: "hollow-crystal-spire.webp" },
];

function artURL(url) {
  if (!url) return "";
  return String(url).startsWith(HALLOWEEN_ART)
    ? `${url}${String(url).includes("?") ? "&" : "?"}v=${ART_REVISION}`
    : url;
}
function localArt(name) { return artURL(`${HALLOWEEN_ART}${name}`); }

function actionKey(kind, target = "seasonal") {
  const suffix = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${kind}:${target}:${suffix}`;
}
async function finishedAction(response) {
  const action = response?.action;
  if (!action?.id) throw new Error("Crystal Guild did not return an event request ID.");
  if (action.status === "completed" || action.status === "failed") return action;
  return waitForPortalAction(action.id, { attempts: 32, delayMs: 650 });
}

function formatEventDate(value, fallback = "TBD") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function pct(current, target) {
  const max = Math.max(1, Number(target || 0));
  return Math.max(0, Math.min(100, Math.round((Number(current || 0) / max) * 100)));
}

export default function SeasonalEvent({ data = {}, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [liveEvent, setLiveEvent] = useState(null);
  const [liveSyncing, setLiveSyncing] = useState(false);
  const stateRequestRef = useRef("");
  const mirroredEvent = data.seasonal || data || {};
  const username = String(overview?.identity?.username || data?.player?.username || "").toLowerCase();
  const capabilities = useMemo(() => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []), [auth.action_capabilities]);
  const own = Boolean(auth.authenticated && auth.player?.username && String(auth.player.username).toLowerCase() === username);
  const canStateSync = Boolean(own && auth.actions_enabled && capabilities.has("SEASONAL_STATE"));
  const event = liveEvent || mirroredEvent;
  const canBuy = Boolean(own && auth.actions_enabled && capabilities.has("SEASONAL_BUY") && event.redemption);
  const mirroredIncomplete = !Array.isArray(mirroredEvent?.variants) || !Array.isArray(mirroredEvent?.objectives) || !Array.isArray(mirroredEvent?.shop);

  useEffect(() => {
    if (!canStateSync || !username) return undefined;
    const mirrorSignature = [mirroredEvent?.state, mirroredEvent?.enabled, mirroredEvent?.paused, mirroredEvent?.activation_mode, mirroredEvent?.ends_at].map((value) => String(value ?? "")).join(":");
    const requestKey = `${username}:${String(auth.player?.username || "").toLowerCase()}:${mirrorSignature}`;
    if (stateRequestRef.current === requestKey) return undefined;
    stateRequestRef.current = requestKey;
    let cancelled = false;
    setLiveSyncing(true);
    const run = async () => {
      try {
        const response = await submitSeasonalState(auth.csrf_token || "", actionKey("seasonal-state", username));
        const finished = await finishedAction(response);
        const snapshot = finished?.result?.data?.seasonal;
        if (!cancelled && finished?.status === "completed" && snapshot && typeof snapshot === "object") {
          setLiveEvent(snapshot);
          setMessage("");
          onRefresh?.();
          return;
        }
        if (!cancelled) setMessage(finished?.result?.message || "The live Seasonal Event state could not be loaded from the Bot.");
      } catch (error) {
        if (!cancelled && error?.name !== "AbortError") setMessage(`Live Seasonal Event sync failed: ${String(error?.message || error)}`);
      } finally {
        if (!cancelled) setLiveSyncing(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [canStateSync, username, auth.csrf_token, auth.player?.username, mirroredEvent?.state, mirroredEvent?.enabled, mirroredEvent?.paused, mirroredEvent?.activation_mode, mirroredEvent?.ends_at, onRefresh]);

  useEffect(() => {
    if (!liveEvent || !mirroredEvent || typeof mirroredEvent !== "object") return;
    const globalKeys = ["event_id", "edition_id", "name", "enabled", "paused", "activation_mode", "starts_at", "ends_at", "redemption_ends_at", "state", "active", "redemption"];
    const control = {};
    for (const key of globalKeys) if (key in mirroredEvent) control[key] = mirroredEvent[key];
    if (Object.keys(control).length) setLiveEvent((current) => current ? { ...current, ...control } : current);
  }, [mirroredEvent?.state, mirroredEvent?.enabled, mirroredEvent?.paused, mirroredEvent?.activation_mode, mirroredEvent?.starts_at, mirroredEvent?.ends_at, mirroredEvent?.redemption_ends_at, mirroredEvent?.active, mirroredEvent?.redemption]);

  if (!liveEvent && canStateSync && liveSyncing && mirroredIncomplete) {
    return <section className="panel seasonal-sync-pending" role="status">
      <p className="eyebrow">Seasonal Event</p>
      <h2>Refreshing the live event board</h2>
      <p>Checking the authoritative Bot state so this page does not rely on an older mirrored event snapshot.</p>
    </section>;
  }

  if (!liveEvent && (event.sync_pending || event.state === "unavailable")) {
    return <section className="panel seasonal-sync-pending" role="status">
      <p className="eyebrow">Seasonal Event</p>
      <h2>The event board is still loading</h2>
      <p>We haven’t received the latest event details yet. Try refreshing. If the board still looks empty, the streamer may need to check that the Bot and Portal are up to date.</p>
      <button type="button" className="equipment-action-button secondary" onClick={() => onRefresh?.()}>Refresh</button>
    </section>;
  }

  const variants = Array.isArray(event.variants) ? event.variants : [];
  const objectives = Array.isArray(event.objectives) ? event.objectives : [];
  const rewards = Array.isArray(event.shop) ? event.shop : [];
  const trophies = Array.isArray(event.trophies) ? event.trophies : [];
  const discoveredVariants = variants.filter((monster) => Number(monster.clears || 0) > 0).length;
  const completedObjectives = objectives.filter((objective) => objective.complete).length;
  const unlockedTrophies = trophies.filter((trophy) => trophy.unlocked_at).length;
  const wardenDiscovered = Boolean(trophies.some((entry) => entry.id === "season_halloween_warden" && entry.unlocked_at));
  const stateLabel = humanizeLabel(event.state, "Not active");
  const stateTone = event.active ? "active" : event.state === "paused" ? "paused" : event.redemption ? "redemption" : "inactive";
  const eventEnd = formatEventDate(event.ends_at);
  const redemptionEnd = formatEventDate(event.redemption_ends_at);

  const buy = async (reward) => {
    if (!canBuy || busy || (reward.owned && !reward.repeatable)) return;
    setBusy(reward.id);
    setMessage(`Requesting ${reward.name} from the Moonlit Emporium…`);
    try {
      const response = await submitSeasonalBuy(reward.id, auth.csrf_token || "", actionKey("seasonal-buy", reward.id));
      const finished = await finishedAction(response);
      const snapshot = finished?.result?.data?.seasonal;
      if (snapshot && typeof snapshot === "object") setLiveEvent(snapshot);
      setMessage(finished?.result?.message || "The Moonlit Emporium has your request!");
      onRefresh?.();
    } catch (error) {
      setMessage(String(error?.message || error));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="dashboard-grid seasonal-event-page seasonal-art-hotfix3 seasonal-event-rework">
      {message ? <div className="panel span-12 seasonal-live-sync-message" role="status">{message}</div> : null}
      <section className="panel span-12 seasonal-event-hero seasonal-event-command-hero">
        <div className="seasonal-event-banner-wrap">
          <img className="seasonal-event-banner" src={artURL(event.art?.banner || `${HALLOWEEN_ART}event-banner.webp`)} alt="Night of the Hollow Crystal — moonlit castle and the Hollow Warden" />
          <span className={`seasonal-state-badge ${stateTone}`}>{stateLabel}</span>
        </div>
        <div className="seasonal-event-hero-copy">
          <p className="eyebrow">Seasonal Event · Halloween 2026</p>
          <h2>{event.name || "Night of the Hollow Crystal"}</h2>
          <p className="seasonal-event-intro">The Hollow Crystal has awakened again. Hunt seasonal creatures, complete the daily rotation, and trade Moonlit Tokens for limited rewards while the event is live.</p>
          <div className="seasonal-event-window" aria-label="Event schedule">
            <span><strong>Event ends</strong>{eventEnd}</span>
            <span><strong>Emporium closes</strong>{redemptionEnd}</span>
          </div>
          <div className="seasonal-event-stat-grid">
            <article className="seasonal-stat-card seasonal-wallet-card">
              <img src={localArt("moonlit-token.webp")} alt="" />
              <div><strong>{number(event.tokens || 0)}</strong><span>{event.token_name || "Moonlit Tokens"}</span></div>
            </article>
            <article className="seasonal-stat-card"><strong>{number(Math.min(Number(event.daily_kills || 0), Number(event.daily_kill_cap || 0)))} / {number(event.daily_kill_cap || 0)}</strong><span>Daily token kills</span></article>
            <article className="seasonal-stat-card"><strong>{discoveredVariants} / {variants.length}</strong><span>Creatures discovered</span></article>
            <article className="seasonal-stat-card"><strong>{number(event.guild_seasonal_kills || 0)}</strong><span>Guild event defeats</span></article>
          </div>
        </div>
      </section>

      <section className="panel span-5 seasonal-objective-panel">
        <div className="panel-heading seasonal-compact-heading">
          <div><p className="eyebrow">Today’s Rotation</p><h3>Event Objectives</h3></div>
          <span className="seasonal-heading-count">{completedObjectives} / {objectives.length} complete</span>
        </div>
        <p className="seasonal-section-copy">Progress is tracked automatically. Finished objectives deposit their Moonlit Tokens without a separate claim step.</p>
        <div className="seasonal-objective-list seasonal-objective-rework">
          {objectives.map((objective) => {
            const progress = Math.min(Number(objective.progress || 0), Number(objective.target || 0));
            const percent = pct(progress, objective.target);
            return <article className={`seasonal-objective ${objective.complete ? "is-complete" : ""}`} key={objective.id}>
              <div className="seasonal-objective-head">
                <strong>{objective.name}</strong>
                <span>{objective.complete ? "Complete" : `+${objective.reward} Tokens`}</span>
              </div>
              <p>{objective.description}</p>
              <div className="seasonal-progress-row"><span className="seasonal-progress-track"><span style={{ width: `${percent}%` }} /></span><b>{number(progress)} / {number(objective.target)}</b></div>
            </article>;
          })}
          {!objectives.length ? <div className="seasonal-empty-state">No event objectives are available right now.</div> : null}
        </div>
      </section>

      <section className="panel span-7 seasonal-shop-panel seasonal-shop-rework">
        <div className="seasonal-shop-heading-row">
          <div className="panel-heading seasonal-compact-heading"><div><p className="eyebrow">Limited Rewards</p><h3>Moonlit Emporium</h3></div></div>
          <div className="seasonal-shop-balance"><img src={localArt("moonlit-token.webp")} alt="" /><strong>{number(event.tokens || 0)}</strong><span>available</span></div>
        </div>
        <img className="seasonal-shop-banner" src={localArt("emporium-header.webp")} alt="Moonlit Emporium" loading="lazy" />
        <div className="seasonal-shop-grid seasonal-shop-grid-rework">
          {rewards.map((reward) => {
            const unaffordable = Number(event.tokens || 0) < Number(reward.cost || 0);
            const owned = Boolean(reward.owned && !reward.repeatable);
            const description = reward.description || REWARD_DESCRIPTIONS[reward.id];
            return <article className={`seasonal-shop-card ${owned ? "is-owned" : ""}`} key={reward.id}>
              <img src={artURL(reward.art)} alt="" loading="lazy" decoding="async" />
              <div className="seasonal-shop-card-copy"><strong>{reward.name}</strong><span>{reward.repeatable ? "Repeatable reward" : owned ? "Collected" : "Limited reward"}</span><p>{number(reward.cost)} {event.token_name || "Moonlit Tokens"}</p>{description ? <p className="seasonal-reward-description">{description}</p> : null}</div>
              <button type="button" className="equipment-action-button" disabled={!canBuy || Boolean(busy) || owned || unaffordable} onClick={() => buy(reward)}>{owned ? "Owned" : busy === reward.id ? "Claiming…" : unaffordable ? "Need Tokens" : "Claim"}</button>
            </article>;
          })}
        </div>
        {!event.redemption ? <p className="seasonal-shop-note">The Emporium opens while the event is active and remains available during the redemption window.</p> : null}
        {message ? <div className="state-message compact-state" role="status">{message}</div> : null}
      </section>

      <section className="panel span-12 seasonal-bestiary-panel seasonal-bestiary-rework">
        <div className="panel-heading seasonal-compact-heading">
          <div><p className="eyebrow">Event Bestiary</p><h3>Things Stirring in the Dark</h3></div>
          <span className="seasonal-heading-count">{discoveredVariants} / {variants.length} discovered</span>
        </div>
        <div className="seasonal-monster-grid seasonal-monster-grid-rework">
          {variants.map((monster) => {
            const discovered = Number(monster.clears || 0) > 0;
            return <article className={`seasonal-monster-card ${discovered ? "is-discovered" : "is-undiscovered"}`} key={monster.id}>
              <img src={artURL(discovered ? monster.art : monster.locked_art)} alt={discovered ? monster.name : "Undiscovered seasonal monster"} loading="lazy" decoding="async" />
              <div className="seasonal-monster-copy"><h4>{discovered ? monster.name : "???"}</h4><p>{discovered ? monster.element : "Unknown creature"}</p><span>{discovered ? `${number(monster.clears)} defeated` : "Not yet encountered"}</span></div>
            </article>;
          })}
        </div>
        {event.world_event ? <article className="seasonal-warden-callout">
          <img src={artURL(wardenDiscovered ? event.world_event.art : (event.world_event.locked_art || event.world_event.art))} alt={wardenDiscovered ? event.world_event.name : "Undiscovered Hollow Warden"} loading="lazy" decoding="async" />
          <div><p className="eyebrow">Seasonal World Event</p><h4>{event.world_event.name}</h4><p>{event.world_event.description}</p><span>{wardenDiscovered ? "Recorded in your seasonal collection" : "Defeat the Warden to reveal its permanent record"}</span></div>
        </article> : null}
      </section>

      <section className="span-12 seasonal-secondary-grid" aria-label="Seasonal collections and scenery">
        <details className="panel seasonal-collection-panel">
          <summary>
            <span><small>Permanent Collection</small><strong>Event Trophies</strong></span>
            <span className="seasonal-summary-meta">{unlockedTrophies} / {trophies.length} unlocked</span>
          </summary>
          <div className="seasonal-trophy-grid seasonal-trophy-grid-rework">
            {trophies.map((trophy) => <article className={`seasonal-trophy-card ${trophy.unlocked_at ? "is-unlocked" : "is-locked"}`} key={trophy.id}>
              <img src={artURL(trophy.unlocked_at ? trophy.art : trophy.locked_art)} alt={trophy.unlocked_at ? trophy.name : "Locked seasonal trophy"} loading="lazy" decoding="async" />
              <div><strong>{trophy.unlocked_at ? trophy.name : "???"}</strong><p>{trophy.unlocked_at ? trophy.description : "Its story has yet to be written."}</p></div>
            </article>)}
          </div>
        </details>

        <details className="panel seasonal-scenery-panel seasonal-scenery-rework">
          <summary>
            <span><small>Event Gallery</small><strong>Haunted Realm</strong></span>
            <span className="seasonal-summary-meta">4 locations</span>
          </summary>
          <img className="seasonal-scenery-header" src={localArt("seasonal-header.webp")} alt="Seasonal Event — Night of the Hollow Crystal" loading="lazy" />
          <div className="seasonal-scenery-grid">{SCENES.map((scene) => <figure key={scene.file}>
            <img src={localArt(scene.file)} alt={scene.name} loading="lazy" decoding="async" />
            <figcaption>{scene.name}</figcaption>
          </figure>)}</div>
        </details>
      </section>
    </div>
  );
}
