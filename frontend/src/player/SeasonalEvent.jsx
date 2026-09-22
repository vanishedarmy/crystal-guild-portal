import { useMemo, useState } from "react";
import { submitSeasonalBuy, waitForPortalAction } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { number } from "../utils/formatters.js";

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

  const buy = async (reward) => {
    if (!canBuy || busy || reward.owned) return;
    setBusy(reward.id);
    setMessage(`Requesting ${reward.name} from the Moonlit Emporium…`);
    try {
      const response = await submitSeasonalBuy(reward.id, auth.csrf_token || "", actionKey("seasonal-buy", reward.id));
      const finished = await finishedAction(response);
      setMessage(finished?.result?.message || "Seasonal reward request complete.");
      onRefresh?.();
    } catch (error) {
      setMessage(String(error?.message || error));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="dashboard-grid seasonal-event-page">
      <section className="panel span-12 seasonal-event-hero">
        <img src={event.art?.banner || "/seasonal/halloween-2026/event-banner.webp"} alt="Night of the Hollow Crystal seasonal event" />
        <div className="seasonal-event-hero-copy">
          <p className="eyebrow">Seasonal Event · {event.state || "disabled"}</p>
          <h2>{event.name || "Night of the Hollow Crystal"}</h2>
          <p className="muted">The Hollow Crystal burns violet beneath the autumn moon. Seasonal monsters, rotating objectives, and the Hollow Warden appear only while this event edition is active.</p>
          <div className="currency-row"><div className="currency-box"><strong>{number(event.tokens || 0)}</strong><span>{event.token_name || "Moonlit Tokens"}</span></div><div className="currency-box"><strong>{number(event.guild_seasonal_kills || 0)}</strong><span>Guild seasonal defeats</span></div></div>
        </div>
      </section>

      <section className="panel span-12">
        <div className="panel-heading"><div><p className="eyebrow">Event Bestiary</p><h3>Things stirring in the dark</h3></div></div>
        <div className="seasonal-monster-grid">
          {(event.variants || []).map((monster) => {
            const discovered = Number(monster.clears || 0) > 0;
            return <article className="seasonal-monster-card" key={monster.id}>
              <img src={discovered ? monster.art : monster.locked_art} alt={discovered ? monster.name : "Undiscovered seasonal monster"} />
              <h4>{discovered ? monster.name : "???"}</h4><p>{monster.element}</p><span>{discovered ? `${monster.clears} defeated` : "Not yet encountered"}</span>
            </article>;
          })}
          {event.world_event ? <article className="seasonal-monster-card seasonal-boss-card"><img src={event.world_event.art} alt={event.world_event.name} /><h4>{event.world_event.name}</h4><p>Seasonal World Event</p><span>{event.world_event.description}</span></article> : null}
        </div>
      </section>

      <section className="panel span-6">
        <div className="panel-heading"><div><p className="eyebrow">Daily Rotation</p><h3>Event Objectives</h3></div></div>
        <div className="seasonal-objective-list">{(event.objectives || []).map((objective) => <div className={`seasonal-objective ${objective.complete ? "is-complete" : ""}`} key={objective.id}><div><strong>{objective.name}</strong><p>{objective.description}</p></div><span>{number(objective.progress)} / {number(objective.target)} · {objective.reward} Tokens</span></div>)}</div>
      </section>

      <section className="panel span-6">
        <div className="panel-heading"><div><p className="eyebrow">Temporary Counter</p><h3>Moonlit Emporium</h3></div></div>
        <div className="seasonal-shop-grid">{(event.shop || []).map((reward) => <article className="seasonal-shop-card" key={reward.id}><img src={reward.art} alt="" /><div><strong>{reward.name}</strong><p>{reward.cost} {event.token_name || "Moonlit Tokens"}</p></div><button type="button" className="equipment-action-button" disabled={!canBuy || Boolean(busy) || (reward.owned && !reward.repeatable) || Number(event.tokens || 0) < Number(reward.cost || 0)} onClick={() => buy(reward)}>{reward.owned && !reward.repeatable ? "Owned" : busy === reward.id ? "Claiming…" : "Acquire"}</button></article>)}</div>
        {message ? <div className="state-message compact-state" role="status">{message}</div> : null}
      </section>

      <section className="panel span-12">
        <div className="panel-heading"><div><p className="eyebrow">Permanent Collection</p><h3>Night of the Hollow Crystal Trophies</h3></div></div>
        <div className="seasonal-trophy-grid">{(event.trophies || []).map((trophy) => <article className={`seasonal-trophy-card ${trophy.unlocked_at ? "is-unlocked" : "is-locked"}`} key={trophy.id}><img src={trophy.unlocked_at ? trophy.art : trophy.locked_art} alt={trophy.unlocked_at ? trophy.name : "Locked seasonal trophy"} /><strong>{trophy.unlocked_at ? trophy.name : "???"}</strong><p>{trophy.unlocked_at ? trophy.description : "Its story has yet to be written."}</p></article>)}</div>
      </section>
    </div>
  );
}
