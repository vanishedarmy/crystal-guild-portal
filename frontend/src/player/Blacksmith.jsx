import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  submitCraftingState,
  submitCraftRecipe,
  submitForgeItem,
  submitResynthesizeItem,
  waitForPortalAction,
} from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { number } from "../utils/formatters.js";
import { handleTabListKeyDown } from "../utils/tabKeyboard.js";
import ItemArtwork from "../components/ItemArtwork.jsx";
import { DetailsPointer } from "../components/CollapsePointer.jsx";
import { clampQuantity } from "../utils/quantityInput.js";
import ContextHelp from "../components/ContextHelp.jsx";
import CraftingWorkbench from "./CraftingWorkbench.jsx";

function actionKey(kind, target = "blacksmith") {
  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${kind}:${target}:${suffix}`;
}

async function finishedAction(response) {
  const action = response?.action;
  if (!action?.id) throw new Error("Crystal Guild did not return a request ID.");
  if (action.status === "completed" || action.status === "failed") return action;
  return waitForPortalAction(action.id, { attempts: 28, delayMs: 650 });
}

function titleCase(value) {
  return String(value || "item").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function blacksmithLoadError(error) {
  const message = String(error?.message || "The Blacksmith ledger could not be loaded.");
  if (/CRAFTING_STATE does not accept parameters/i.test(message)) {
    return "The hosted Portal is running the old Blacksmith validator. Deploy the 1.9.4.1 hosted Web hotfix, restart the service, and retry.";
  }
  return message;
}

const FORGE_TYPE_ORDER = { weapon: 0, armor: 1, accessory: 2 };
const FORGE_TYPE_SEQUENCE = ["weapon", "armor", "accessory"];

function forgeTypeRank(value) {
  return FORGE_TYPE_ORDER[String(value || "").toLowerCase()] ?? 99;
}

function forgeTypeGroups(items = []) {
  return FORGE_TYPE_SEQUENCE
    .map((type) => ({ type, items: items.filter((item) => String(item.type || "").toLowerCase() === type) }))
    .filter((group) => group.items.length);
}

export default function Blacksmith({ data, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [view, setView] = useState("recipes");
  const [query, setQuery] = useState("");
  const [quantities, setQuantities] = useState({});
  const [busyKey, setBusyKey] = useState("");
  const [message, setMessage] = useState("");
  const [loadStatus, setLoadStatus] = useState("idle");
  const [loadError, setLoadError] = useState("");
  const stateRequestRef = useRef(null);

  const username = String(overview?.identity?.username || data?.identity?.username || data?.player?.username || "").toLowerCase();
  const isOwnProfile = Boolean(
    auth.authenticated
    && auth.player?.username
    && String(auth.player.username).toLowerCase() === username
  );
  const capabilities = useMemo(
    () => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []),
    [auth.action_capabilities],
  );
  const actionsAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && ["CRAFTING_STATE", "CRAFT_RECIPE", "FORGE_ITEM", "RESYNTHESIZE_ITEM"].every((kind) => capabilities.has(kind))
  );
  const csrfToken = auth.csrf_token || "";

  const loadState = useCallback(async ({ quiet = false, force = false } = {}) => {
    if (!actionsAvailable || (busyKey && !force)) return null;
    // Only one large catalog request at a time. After a craft/forge mutation,
    // force a *fresh* read even if an earlier read was still in progress.
    if (stateRequestRef.current) {
      if (!force) return stateRequestRef.current;
      await stateRequestRef.current;
    }
    if (!quiet) {
      setBusyKey("state");
      setMessage("Checking the Guild Blacksmith…");
    }
    setLoadStatus("loading");
    setLoadError("");
    const request = (async () => {
      try {
        const response = await submitCraftingState(csrfToken, actionKey("crafting-state"), "reforged");
        const finished = await finishedAction(response);
        if (!finished) throw new Error("The Blacksmith did not respond in time. Check the Bot connection and retry.");
        if (finished.status !== "completed" || finished.result?.ok === false) {
          throw new Error(finished.result?.message || "Blacksmith state could not be loaded.");
        }
        const next = finished.result?.data?.crafting_state;
        if (!Array.isArray(next?.recipes) || !next?.recipe_categories) {
          throw new Error("The Bot returned an older Blacksmith catalog. Ensure the 1.9.4 Bot is deployed and running alongside the hosted Web.");
        }
        setState(next);
        setLoadStatus("ready");
        if (!quiet) setMessage("Blacksmith inventory refreshed.");
        return next;
      } catch (error) {
        const detail = blacksmithLoadError(error);
        setLoadError(detail);
        setLoadStatus("error");
        // The alert below announces the failure once, rather than repeating
        // the same message in both the polite header and the assertive alert.
        setMessage("");
        return null;
      } finally {
        if (!quiet) setBusyKey("");
      }
    })();
    stateRequestRef.current = request;
    try {
      return await request;
    } finally {
      if (stateRequestRef.current === request) stateRequestRef.current = null;
    }
  }, [actionsAvailable, busyKey, csrfToken]);

  useEffect(() => {
    // Failure is terminal until the user requests a retry. Without this gate,
    // busy-key changes can cause repeated rejected requests and endless loading.
    if (!actionsAvailable || state || loadStatus !== "idle") return;
    void loadState({ quiet: true });
  }, [actionsAvailable, state, loadStatus, loadState]);

  const runMutation = async (key, submit, fallback) => {
    if (!actionsAvailable || busyKey) return;
    setBusyKey(key);
    setMessage("The Blacksmith is working…");
    try {
      const response = await submit();
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("The forge is still working on your request. Check again shortly before trying another time.");
        return;
      }
      setMessage(finished.result?.message || fallback);
      if (finished.status === "completed" && finished.result?.ok !== false) {
        // Every successful operation may change materials or inventory. The
        // mutation receipt intentionally contains only the legacy recipe set,
        // so merging it with 176 Reforged rows leaves craftability stale.
        await loadState({ quiet: true, force: true });
        onRefresh?.();
        window.setTimeout(() => onRefresh?.(), 3200);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey("");
    }
  };

  const recipes = useMemo(() => {
    let values = Array.isArray(state?.recipes) ? [...state.recipes] : [];
    return values.sort((a, b) => Number(a?.level || a?.min_level || 1) - Number(b?.level || b?.min_level || 1) || String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [state?.recipes]);

  const forgeItems = useMemo(() => {
    if (!state) return [];
    const inventory = Array.isArray(data?.items) ? data.items : [];
    const owned = new Map(inventory.map((item) => [item.id, Number(item.quantity || 0)]));
    const rules = new Map((Array.isArray(state.forge_rules) ? state.forge_rules : []).map((rule) => [Number(rule.current_upgrade || 0), rule]));
    let values = inventory
      .filter((item) => ["weapon", "armor", "accessory"].includes(String(item.type || "").toLowerCase()) && Number(item.quantity || 0) > 0)
      .map((item, inventoryOrder) => {
        const current = Number(item.upgrade_level || 0);
        const rule = rules.get(current) || null;
        const maxed = current >= Number(state.forge_max || 0) || !rule;
        const materials = (rule?.materials || []).map((material) => {
          const materialOwned = Number(owned.get(material.item_id) || 0);
          return { ...material, owned: materialOwned, enough: materialOwned >= Number(material.quantity || 0) };
        });
        const affordable = Boolean(rule)
          && Number(state.gil || 0) >= Number(rule.effective_gil || 0)
          && materials.every((material) => material.enough);
        return {
          item_id: item.id,
          name: item.name,
          type: item.type,
          rarity: item.rarity,
          min_level: Number(item.min_level || item.level || 1),
          owned: item.quantity,
          equipped: Boolean(item.equipped),
          current_upgrade: current,
          maxed,
          next_upgrade: maxed ? null : Number(rule.next_upgrade),
          effective_gil: maxed ? 0 : Number(rule.effective_gil || 0),
          discount_gil: maxed ? 0 : Number(rule.discount_gil || 0),
          materials,
          forgeable: Boolean(!state.combat_locked && !maxed && affordable),
          inventory_order: inventoryOrder,
          next_bonus_percent: maxed
            ? Number(rules.get(Math.max(0, current - 1))?.bonus_percent || 0)
            : Number(rule.bonus_percent || 0),
        };
      })
      .sort((a, b) => {
        const groupA = a.equipped ? 0 : a.current_upgrade > 0 ? 1 : 2;
        const groupB = b.equipped ? 0 : b.current_upgrade > 0 ? 1 : 2;
        if (groupA !== groupB) return groupA - groupB;
        if (groupA === 0) return Number(a.inventory_order || 0) - Number(b.inventory_order || 0);
        return forgeTypeRank(a.type) - forgeTypeRank(b.type)
          || a.min_level - b.min_level
          || b.current_upgrade - a.current_upgrade
          || String(a.name).localeCompare(String(b.name));
      });
    const needle = query.trim().toLowerCase();
    if (needle) values = values.filter((item) => [item.name, item.type].some((value) => String(value || "").toLowerCase().includes(needle)));
    return values;
  }, [state, data?.items, query]);

  const forgeGroups = useMemo(() => ([
    { id: "equipped", title: "Currently Equipped", description: "Your active weapon, armor, and accessories appear first.", collapsible: false, items: forgeItems.filter((item) => item.equipped) },
    { id: "forged", title: "Forged Gear", description: "Upgraded gear grouped as Weapon, Armor, then Accessory.", collapsible: true, items: forgeItems.filter((item) => !item.equipped && item.current_upgrade > 0) },
    { id: "unforged", title: "Unforged Gear", description: "Owned +0 gear grouped as Weapon, Armor, then Accessory.", collapsible: true, items: forgeItems.filter((item) => !item.equipped && item.current_upgrade === 0) },
  ]), [forgeItems]);

  const resynthesisItems = useMemo(() => {
    let values = Array.isArray(state?.resynthesis_items) ? [...state.resynthesis_items] : [];
    const needle = query.trim().toLowerCase();
    if (needle) values = values.filter((item) => [item.name, item.type, ...(item.recovery || []).map((entry) => entry.name)]
      .some((value) => String(value || "").toLowerCase().includes(needle)));
    return values.sort((a, b) => forgeTypeRank(a.type) - forgeTypeRank(b.type)
      || Number(a.min_level || 1) - Number(b.min_level || 1)
      || String(a.name || "").localeCompare(String(b.name || "")));
  }, [state?.resynthesis_items, query]);

  const resynthesisGroups = useMemo(() => ["weapon", "armor"]
    .map((type) => ({ type, items: resynthesisItems.filter((item) => String(item.type || "").toLowerCase() === type) }))
    .filter((group) => group.items.length), [resynthesisItems]);

  if (!isOwnProfile) {
    return (
      <section className="panel blacksmith-panel">
        <div className="panel-title-row"><h2>Guild Blacksmith</h2><span className="small-badge">Personal workshop</span></div>
        <div className="moogle-access-note">
          <strong>This workshop view belongs to its adventurer.</strong>
          <span>Sign in with the Twitch account linked to this character to compare materials, craft recipes, forge equipment, and resynthesize unwanted gear.</span>
        </div>
      </section>
    );
  }

  const craft = (recipe) => {
    const maximum = Math.max(1, Number(recipe.max_quantity || 1));
    const quantity = clampQuantity(quantities[recipe.id] ?? 1, maximum);
    return runMutation(
      `craft:${recipe.id}`,
      () => submitCraftRecipe(recipe.id, quantity, csrfToken, actionKey("craft", `${recipe.id}:${quantity}`)),
      "Crafting complete.",
    );
  };

  const forge = (item) => runMutation(
    `forge:${item.item_id}`,
    () => submitForgeItem(item.item_id, csrfToken, actionKey("forge", item.item_id)),
    "Forge upgrade complete.",
  );

  const resynthesize = (item) => {
    const recovery = (item.recovery || []).map((entry) => `${entry.name} × ${number(entry.quantity)}`).join(", ");
    const prompt = `Resynthesize ${item.name}${Number(item.upgrade_level || 0) > 0 ? ` +${number(item.upgrade_level)}` : ""}?\n\nWARNING: This permanently destroys the selected gear and returns ${recovery || "crafting materials"}.\n\nThis action cannot be undone.`;
    if (!window.confirm(prompt)) return null;
    return runMutation(
      `resynthesis:${item.item_id}`,
      () => submitResynthesizeItem(item.item_id, csrfToken, actionKey("resynthesis", item.item_id)),
      "Resynthesis complete.",
    );
  };

  const renderResynthesisCard = (item) => {
    const busy = busyKey === `resynthesis:${item.item_id}`;
    return (
      <article className="blacksmith-card resynthesis-card" key={item.item_id}>
        <ItemArtwork item={item} className="blacksmith-forge-artwork" />
        <div className="blacksmith-card-head">
          <div>
            <span className="slot-label">{titleCase(item.type)} · Lv. {number(item.min_level)}{item.equipped ? " · Equipped" : ""}</span>
            <h3 className={`rarity-${item.rarity || "common"}`}>{item.name}{Number(item.upgrade_level || 0) > 0 ? ` +${number(item.upgrade_level)}` : ""}</h3>
          </div>
          <span className="small-badge">Owned {number(item.owned)}</span>
        </div>
        <div className="resynthesis-recovery">
          <span>Materials Recovered</span>
          <div className="resynthesis-recovery-list">
            {(item.recovery || []).map((entry) => (
              <div key={entry.item_id}>
                <ItemArtwork item={{ ...entry, type: "material" }} className="blacksmith-material-artwork" />
                <strong>{entry.name}</strong>
                <span>× {number(entry.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
        {Number(item.upgrade_level || 0) > 0 && Number(item.owned || 0) > 1 ? <small className="resynthesis-note">Forge-material recovery applies when the final owned copy is broken down.</small> : null}
        <div className="blacksmith-card-actions forge-action">
          <button type="button" className="equipment-action-button" title={item.reason || "Permanently break down one copy into crafting materials."} disabled={!actionsAvailable || !item.resynthesizable || Boolean(busyKey)} onClick={() => resynthesize(item)}>
            {busy ? "Resynthesizing…" : item.resynthesizable ? "Resynthesize" : item.reason || "Unavailable"}
          </button>
        </div>
      </article>
    );
  };

  const renderForgeCard = (item) => {
    const busy = busyKey === `forge:${item.item_id}`;
    return (
      <article className="blacksmith-card forge-card" key={item.item_id}>
        <ItemArtwork item={item} className="blacksmith-forge-artwork" />
        <div className="blacksmith-card-head">
          <div><span className="slot-label">{titleCase(item.type)} · Lv. {number(item.min_level)}{item.equipped ? " · Equipped" : ""}</span><h3 className={`rarity-${item.rarity || "common"}`}>{item.name} +{number(item.current_upgrade)}</h3></div>
          <span className="small-badge">{item.maxed ? "MAX" : `Next +${number(item.next_upgrade)}`}</span>
        </div>
        {item.description ? <p className="blacksmith-description">{item.description}</p> : null}
        {item.maxed ? (
          <div className="blacksmith-maxed">Maximum forge level reached · +{number(item.next_bonus_percent)}% equipment stat bonus.</div>
        ) : (
          <>
            <div className="blacksmith-forge-price">
              <span>Forge fee</span><strong>{number(item.effective_gil)} Gil</strong>
              {Number(item.discount_gil || 0) > 0 ? <small>Workshop saves {number(item.discount_gil)} Gil</small> : null}
            </div>
            <div className="blacksmith-material-list">
              {(item.materials || []).map((material) => (
                <div className={material.enough ? "enough" : "missing"} key={material.item_id}>
                  <ItemArtwork item={{ ...material, type: "material" }} className="blacksmith-material-artwork" /><span>{material.name}</span><strong>{number(material.owned)} / {number(material.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="blacksmith-next-bonus">After forging: <strong>+{number(item.next_bonus_percent)}%</strong> equipment stat bonus over base.</div>
            <div className="blacksmith-card-actions forge-action">
              <button type="button" className="equipment-action-button" disabled={!actionsAvailable || !item.forgeable || Boolean(busyKey)} onClick={() => forge(item)}>
                {busy ? "Forging…" : `Forge ${item.name} to +${number(item.next_upgrade)}`}
              </button>
            </div>
          </>
        )}
      </article>
    );
  };

  return (
    <section className="panel blacksmith-panel">
      <div className="panel-title-row blacksmith-title-row">
        <div>
          <p className="eyebrow">Guild Workshop</p>
          <h2>Guild Blacksmith</h2>
        </div>
        <div className="context-help-actions"><ContextHelp topic="blacksmith" /><div className="blacksmith-wallet">
          <span><strong>{number(state?.gil ?? overview?.identity?.gil ?? 0)}</strong> Gil</span>
          <span><strong>{number(state?.hunt_seals ?? overview?.identity?.hunt_seals ?? 0)}</strong> Seals</span>
        </div></div>
      </div>

      <div className={`equipment-action-status ${actionsAvailable ? "ready" : "offline"}`}>
        <strong>{!actionsAvailable ? "The forge is closed for now" : !state && loadStatus === "error" ? "Blacksmith ledger unavailable" : "The forge is open"}</strong>
        <span>{actionsAvailable
          ? "Recipe costs, forge levels, and resynthesis eligibility are checked again before every action."
          : "Crafting, forging, and resynthesis return when Crystal Guild reconnects."}</span>
        {message ? <small aria-live="polite">{message}</small> : null}
      </div>

      <div className="blacksmith-toolbar">
        <div className="blacksmith-view-switch" role="tablist" aria-label="Blacksmith services" aria-orientation="horizontal" onKeyDown={(event) => handleTabListKeyDown(event, setView)}>
          <button type="button" role="tab" id="blacksmith-tab-recipes" data-tab-value="recipes" tabIndex={view === "recipes" ? 0 : -1} aria-controls="blacksmith-active-panel" aria-selected={view === "recipes"} className={view === "recipes" ? "active" : ""} onClick={() => setView("recipes")}><span>Crafting</span><small>Items and equipment</small></button>
          <button type="button" role="tab" id="blacksmith-tab-forge" data-tab-value="forge" tabIndex={view === "forge" ? 0 : -1} aria-controls="blacksmith-active-panel" aria-selected={view === "forge"} className={view === "forge" ? "active" : ""} onClick={() => setView("forge")}><span>Forge Gear</span><small>Upgrade equipment</small></button>
          <button type="button" role="tab" id="blacksmith-tab-resynthesis" data-tab-value="resynthesis" tabIndex={view === "resynthesis" ? 0 : -1} aria-controls="blacksmith-active-panel" aria-selected={view === "resynthesis"} className={view === "resynthesis" ? "active" : ""} onClick={() => setView("resynthesis")}><span>Resynthesize Gear</span><small>Recover materials</small></button>
        </div>
        <label className="blacksmith-search"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={view === "recipes" ? "Recipe, output, material…" : view === "resynthesis" ? "Gear or recovered material…" : "Equipment…"} /></label>
      </div>

      {!state && actionsAvailable && loadStatus !== "error" ? <div className="state-message compact-state" role="status">Opening your Blacksmith ledger…</div> : null}
      {actionsAvailable && loadStatus === "error" ? (
        <div className="state-message compact-state blacksmith-load-alert" role="alert">
          <strong>{state ? "Blacksmith refresh failed; displayed materials may be outdated." : "Blacksmith ledger could not load."}</strong>
          <span>{loadError}</span>
          <button type="button" className="equipment-action-button blacksmith-load-retry" disabled={Boolean(busyKey)} onClick={() => void loadState({ force: true })}>Retry Blacksmith</button>
        </div>
      ) : null}
      {!state && !actionsAvailable ? <div className="state-message compact-state">Live Blacksmith data becomes available when Crystal Guild is online.</div> : null}
      {state?.combat_locked ? <div className="moogle-combat-lock">Blacksmith actions are locked while this adventurer is committed to an active encounter or raid.</div> : null}

      {state && view === "recipes" ? (
        <CraftingWorkbench
          recipes={recipes}
          categories={state.recipe_categories || {}}
          username={username}
          query={query}
          quantities={quantities}
          setQuantities={setQuantities}
          busyKey={busyKey}
          actionsAvailable={actionsAvailable}
          onCraft={craft}
        />
      ) : null}

      {state && view === "forge" ? (
        <>
          <div className="blacksmith-summary-row">
            <span>Owned forgeable equipment · maximum +{number(state.forge_max)}</span>
            <span>Workshop facility discounts are already included.</span>
          </div>
          <div id="blacksmith-active-panel" className="blacksmith-grid forge-grid" role="tabpanel" tabIndex="0" aria-labelledby="blacksmith-tab-forge">
            {forgeGroups.map((group) => {
              if (!group.items.length) return null;
              const typeGroups = group.id === "equipped" ? [] : forgeTypeGroups(group.items);
              const groupBody = group.id === "equipped" ? (
                <div className="forge-group-body forge-group-body-flat">
                  <div className="forge-group-grid forge-equipped-grid">
                    {group.items.map(renderForgeCard)}
                  </div>
                </div>
              ) : (
                <div className="forge-group-body">
                  {typeGroups.map((typeGroup) => (
                    <section className="forge-type-group" key={`${group.id}-${typeGroup.type}`} aria-label={`${titleCase(typeGroup.type)} gear`}>
                      <div className="forge-type-heading">
                        <strong>{titleCase(typeGroup.type)}</strong>
                        <span>{number(typeGroup.items.length)}</span>
                      </div>
                      <div className="forge-group-grid">
                        {typeGroup.items.map(renderForgeCard)}
                      </div>
                    </section>
                  ))}
                </div>
              );

              const heading = (
                <>
                  <div>
                    <h3 id={`forge-group-${group.id}`}>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                  <span className="forge-group-heading-meta">
                    <span className="small-badge">{number(group.items.length)} item{group.items.length === 1 ? "" : "s"}</span>
                    {group.collapsible ? <DetailsPointer /> : null}
                  </span>
                </>
              );

              return group.collapsible ? (
                <details className="forge-group forge-group-disclosure" key={group.id} aria-labelledby={`forge-group-${group.id}`}>
                  <summary className="forge-group-heading">{heading}</summary>
                  {groupBody}
                </details>
              ) : (
                <section className="forge-group" key={group.id} aria-labelledby={`forge-group-${group.id}`}>
                  <div className="forge-group-heading">{heading}</div>
                  {groupBody}
                </section>
              );
            })}
          </div>
          {!forgeItems.length ? <div className="state-message compact-state">No owned equipment matches that search.</div> : null}
        </>
      ) : null}

      {state && view === "resynthesis" ? (
        <>
          <div className="blacksmith-summary-row">
            <span><strong>{number(state.resynthesis_count || 0)}</strong> items resynthesized</span>
            <span>Weapons and armor only · Relic and Artifact gear protected</span>
          </div>
          <div className="resynthesis-warning" role="note"><strong>Warning:</strong> Resynthesizing permanently destroys the selected gear.</div>
          <div id="blacksmith-active-panel" className="resynthesis-shell" role="tabpanel" tabIndex="0" aria-labelledby="blacksmith-tab-resynthesis">
            {resynthesisGroups.map((group) => (
              <section className="forge-type-group" key={`resynthesis-${group.type}`} aria-label={`${titleCase(group.type)} resynthesis`}>
                <div className="forge-type-heading">
                  <strong>{titleCase(group.type)}</strong>
                  <span>{number(group.items.length)}</span>
                </div>
                <div className="forge-group-grid resynthesis-grid">
                  {group.items.map(renderResynthesisCard)}
                </div>
              </section>
            ))}
          </div>
          {!resynthesisItems.length ? <div className="state-message compact-state">No resynthesizable weapons or armor match that search.</div> : null}
        </>
      ) : null}
    </section>
  );
}
