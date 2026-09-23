import { useMemo, useState } from "react";
import { submitSeasonalBuy, waitForPortalAction } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { number } from "../utils/formatters.js";
import { humanizeLabel } from "../utils/displayLabels.js";

const HALLOWEEN_ART = "/seasonal/halloween-2026/";
const ART_REVISION = "halloween-art-hotfix3";
const SCENES = [
  { name: "Haunted Ruins", file: "haunted-ruins.webp" },
  { name: "Graveyard", file: "graveyard.webp" },
  { name: "Eerie Forest", file: "eerie-forest.webp" },
  { name: "Hollow Crystal Spire", file: "hollow-crystal-spire.webp" },
];

// Changing the artwork must not require a Bot/protocol migration; image URLs
// receive their own cache revision so browsers discard the retired sheet crops.
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

export default function SeasonalEvent({ data = {}, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const event = data.seasonal || data || {};
  const username = String(overview?.identity?.username || data?.player?.username || "").toLowerCase();
  const capabilities = useMemo(() => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []), [auth.action_capabilities]);
  const own = Boolean(auth.authenticated && auth.player?.username && String(auth.player.username).toLowerCase() === username);
  const canBuy = Boolean(own && auth.actions_enabled && capabilities.has("SEASONAL_BUY") && event.redemption);
  const wardenDiscovered = Boolean((event.trophies || []).some((entry) => entry.id === "season_halloween_warden" && entry.unlocked_at));

  // Old sync snapshots have no seasonal module; show a recoverable state.
  if (event.sync_pending || event.state === "unavailable") {
    return <section className="panel seasonal-sync-pending" role="status">
      <p className="eyebrow">Seasonal Event</p>
      <h2>The event board is still loading</h2>
      <p>We haven’t received the latest event details yet. Try refreshing. If the board still looks empty, the streamer may need to check that the Bot and Portal are up to date.</p>
      <button type="button" className="equipment-action-button secondary" onClick={() => onRefresh?.()}>Refresh</button>
    </section>;
  }

  const buy = async (reward) => {
    if (!canBuy || busy || (reward.owned && !reward.repeatable)) return;
    setBusy(reward.id);
    setMessage(`Requesting ${reward.name} from the Moonlit Emporium…`);
    try {
      const response = await submitSeasonalBuy(reward.id, auth.csrf_token || "", actionKey("seasonal-buy", reward.id));
      const finished = await finishedAction(response);
      setMessage(finished?.result?.message || "The Moonlit Emporium has your request!");
      onRefresh?.();
    } catch (error) {
      setMessage(String(error?.message || error));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="dashboard-grid seasonal-event-page seasonal-art-hotfix3">
      <section className="panel span-12 seasonal-event-hero">
        <img className="seasonal-event-banner" src={artURL(event.art?.banner || `${HALLOWEEN_ART}event-banner.webp`)} alt="Night of the Hollow Crystal — moonlit castle and the Hollow Warden" />
        <div className="seasonal-event-hero-copy">
          <p className="eyebrow">Seasonal Event · {humanizeLabel(event.state, "Not active")}</p>
          <h2>{event.name || "Night of the Hollow Crystal"}</h2>
          <p className="muted">A violet glow has returned to the Hollow Crystal. While the event is live, strange creatures roam the realm, new challenges appear each day, and the Hollow Warden may stir.</p>
          <div className="currency-row">
            <div className="currency-box seasonal-wallet"><img src={localArt("moonlit-token.webp")} alt="" /><div><strong>{number(event.tokens || 0)}</strong><span>{event.token_name || "Moonlit Tokens"}</span></div></div>
            <div className="currency-box"><strong>{number(event.guild_seasonal_kills || 0)}</strong><span>Monsters defeated together</span></div>
          </div>
        </div>
      </section>

      <section className="panel span-12 seasonal-bestiary-panel">
        <img className="seasonal-section-art" src={localArt("bestiary-header.webp")} alt="Event Bestiary" loading="lazy" />
        <div className="panel-heading"><div><p className="eyebrow">Event Bestiary</p><h3>Things stirring in the dark</h3></div></div>
        <div className="seasonal-monster-grid">
          {(event.variants || []).map((monster) => {
            const discovered = Number(monster.clears || 0) > 0;
            return <article className="seasonal-monster-card" key={monster.id}>
              <img src={artURL(discovered ? monster.art : monster.locked_art)} alt={discovered ? monster.name : "Undiscovered seasonal monster"} loading="lazy" decoding="async" />
              <h4>{discovered ? monster.name : "???"}</h4><p>{monster.element}</p><span>{discovered ? `${monster.clears} defeated` : "Not yet encountered"}</span>
            </article>;
          })}
          {event.world_event ? <article className="seasonal-monster-card seasonal-boss-card">
            <img src={artURL(wardenDiscovered ? event.world_event.art : (event.world_event.locked_art || event.world_event.art))} alt={wardenDiscovered ? event.world_event.name : "Undiscovered Hollow Warden"} loading="lazy" decoding="async" />
            <h4>{event.world_event.name}</h4><p>Seasonal World Event</p><span>{event.world_event.description}</span>
          </article> : null}
        </div>
      </section>

      <section className="panel span-6">
        <div className="panel-heading"><div><p className="eyebrow">Daily Rotation</p><h3>Event Objectives</h3></div></div>
        <div className="seasonal-objective-list">{(event.objectives || []).map((objective) => <div className={`seasonal-objective ${objective.complete ? "is-complete" : ""}`} key={objective.id}><div><strong>{objective.name}</strong><p>{objective.description}</p></div><span>{number(objective.progress)} / {number(objective.target)} · {objective.reward} Tokens</span></div>)}</div>
      </section>

      <section className="panel span-6 seasonal-shop-panel">
        <img className="seasonal-section-art" src={localArt("emporium-header.webp")} alt="Moonlit Emporium" loading="lazy" />
        <div className="panel-heading"><div><p className="eyebrow">For a limited time</p><h3>Moonlit Emporium</h3></div></div>
        <div className="seasonal-shop-grid">{(event.shop || []).map((reward) => <article className="seasonal-shop-card" key={reward.id}>
          <img src={artURL(reward.art)} alt="" loading="lazy" decoding="async" />
          <div><strong>{reward.name}</strong><p>{reward.cost} {event.token_name || "Moonlit Tokens"}</p></div>
          <button type="button" className="equipment-action-button" disabled={!canBuy || Boolean(busy) || (reward.owned && !reward.repeatable) || Number(event.tokens || 0) < Number(reward.cost || 0)} onClick={() => buy(reward)}>{reward.owned && !reward.repeatable ? "Owned" : busy === reward.id ? "Claiming…" : "Claim"}</button>
        </article>)}</div>
        {message ? <div className="state-message compact-state" role="status">{message}</div> : null}
      </section>

      <section className="panel span-12">
        <div className="panel-heading"><div><p className="eyebrow">Permanent Collection</p><h3>Night of the Hollow Crystal Trophies</h3></div></div>
        <div className="seasonal-trophy-grid">{(event.trophies || []).map((trophy) => <article className={`seasonal-trophy-card ${trophy.unlocked_at ? "is-unlocked" : "is-locked"}`} key={trophy.id}>
          <img src={artURL(trophy.unlocked_at ? trophy.art : trophy.locked_art)} alt={trophy.unlocked_at ? trophy.name : "Locked seasonal trophy"} loading="lazy" decoding="async" />
          <strong>{trophy.unlocked_at ? trophy.name : "???"}</strong><p>{trophy.unlocked_at ? trophy.description : "Its story has yet to be written."}</p>
        </article>)}</div>
      </section>

      <section className="panel span-12 seasonal-scenery-panel">
        <details className="seasonal-scenery-details">
          <summary>Take a look around the haunted realm</summary>
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
