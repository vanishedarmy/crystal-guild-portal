import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitCraftingState,
  submitCraftRecipe,
  submitForgeItem,
  waitForPortalAction,
} from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { number } from "../utils/formatters.js";
import { handleTabListKeyDown } from "../utils/tabKeyboard.js";
import ItemArtwork from "../components/ItemArtwork.jsx";
import { DetailsPointer } from "../components/CollapsePointer.jsx";
import { beginQuantityEdit, clampQuantity, finishQuantityEdit, quantityInputValue, updateQuantityInput } from "../utils/quantityInput.js";

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
    && ["CRAFTING_STATE", "CRAFT_RECIPE", "FORGE_ITEM"].every((kind) => capabilities.has(kind))
  );
  const csrfToken = auth.csrf_token || "";

  const loadState = useCallback(async ({ quiet = false } = {}) => {
    if (!actionsAvailable || busyKey) return null;
    if (!quiet) {
      setBusyKey("state");
      setMessage("Checking the Guild Blacksmith…");
    }
    try {
      const response = await submitCraftingState(csrfToken, actionKey("crafting-state"));
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("The Blacksmith is still updating. Try again in a moment.");
        return null;
      }
      if (finished.status !== "completed" || finished.result?.ok === false) {
        setMessage(finished.result?.message || "Blacksmith state could not be loaded.");
        return null;
      }
      const next = finished.result?.data?.crafting_state || null;
      if (next) setState(next);
      if (!quiet) setMessage("Blacksmith inventory refreshed.");
      return next;
    } catch (error) {
      setMessage(error.message);
      return null;
    } finally {
      if (!quiet) setBusyKey("");
    }
  }, [actionsAvailable, busyKey, csrfToken]);

  useEffect(() => {
    if (!actionsAvailable || state) return;
    void loadState({ quiet: true });
  }, [actionsAvailable, state, loadState]);

  const runMutation = async (key, submit, fallback) => {
    if (!actionsAvailable || busyKey) return;
    setBusyKey(key);
    setMessage("The Blacksmith is working…");
    try {
      const response = await submit();
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("Your Blacksmith request is still being processed. Please wait a moment before trying again.");
        return;
      }
      setMessage(finished.result?.message || fallback);
      const next = finished.result?.data?.crafting_state;
      if (next) setState(next);
      else if (finished.status === "completed" && finished.result?.ok !== false) await loadState({ quiet: true });
      if (finished.status === "completed" && finished.result?.ok !== false) {
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
    const needle = query.trim().toLowerCase();
    if (needle) values = values.filter((recipe) => [recipe.name, recipe.output?.name, ...(recipe.materials || []).map((item) => item.name)]
      .some((value) => String(value || "").toLowerCase().includes(needle)));
    return values.sort((a, b) => Number(a?.level || a?.min_level || 1) - Number(b?.level || b?.min_level || 1) || String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [state?.recipes, query]);

  const forgeItems = useMemo(() => {
    if (!state) return [];
    const inventory = Array.isArray(data?.items) ? data.items : [];
    const owned = new Map(inventory.map((item) => [item.id, Number(item.quantity || 0)]));
    const rules = new Map((Array.isArray(state.forge_rules) ? state.forge_rules : []).map((rule) => [Number(rule.current_upgrade || 0), rule]));
    let values = inventory
      .filter((item) => ["weapon", "armor", "accessory"].includes(String(item.type || "").toLowerCase()) && Number(item.quantity || 0) > 0)
      .map((item) => {
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
          next_bonus_percent: maxed
            ? Number(rules.get(Math.max(0, current - 1))?.bonus_percent || 0)
            : Number(rule.bonus_percent || 0),
        };
      })
      .sort((a, b) => {
        const groupA = a.equipped ? 0 : a.current_upgrade > 0 ? 1 : 2;
        const groupB = b.equipped ? 0 : b.current_upgrade > 0 ? 1 : 2;
        return groupA - groupB
          || forgeTypeRank(a.type) - forgeTypeRank(b.type)
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

  if (!isOwnProfile) {
    return (
      <section className="panel blacksmith-panel">
        <div className="panel-title-row"><h2>Guild Blacksmith</h2><span className="small-badge">Personal workshop</span></div>
        <div className="moogle-access-note">
          <strong>This workshop view belongs to its adventurer.</strong>
          <span>Sign in with the Twitch account linked to this character to compare materials, craft recipes, and forge owned equipment.</span>
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

  return (
    <section className="panel blacksmith-panel">
      <div className="panel-title-row blacksmith-title-row">
        <div>
          <p className="eyebrow">Guild Workshop</p>
          <h2>Guild Blacksmith</h2>
        </div>
        <div className="blacksmith-wallet">
          <span><strong>{number(state?.gil ?? overview?.identity?.gil ?? 0)}</strong> Gil</span>
          <span><strong>{number(state?.hunt_seals ?? overview?.identity?.hunt_seals ?? 0)}</strong> Seals</span>
        </div>
      </div>

      <div className={`equipment-action-status ${actionsAvailable ? "ready" : "offline"}`}>
        <strong>{actionsAvailable ? "Blacksmith connection ready" : "Blacksmith controls unavailable"}</strong>
        <span>{actionsAvailable
          ? "Recipe costs, owned materials, Fellowship Workshop discounts, and forge levels are checked again before every action."
          : "Crafting and forging return when Crystal Guild reconnects."}</span>
        {message ? <small aria-live="polite">{message}</small> : null}
      </div>

      <div className="blacksmith-toolbar">
        <div className="blacksmith-view-switch" role="tablist" aria-label="Blacksmith views" aria-orientation="horizontal" onKeyDown={(event) => handleTabListKeyDown(event, setView)}>
          <button type="button" role="tab" id="blacksmith-tab-recipes" data-tab-value="recipes" tabIndex={view === "recipes" ? 0 : -1} aria-controls="blacksmith-active-panel" aria-selected={view === "recipes"} className={view === "recipes" ? "active" : ""} onClick={() => setView("recipes")}><span>Recipes</span><small>Craft items</small></button>
          <button type="button" role="tab" id="blacksmith-tab-forge" data-tab-value="forge" tabIndex={view === "forge" ? 0 : -1} aria-controls="blacksmith-active-panel" aria-selected={view === "forge"} className={view === "forge" ? "active" : ""} onClick={() => setView("forge")}><span>Forge Gear</span><small>Upgrade equipment</small></button>
        </div>
        <label className="blacksmith-search"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={view === "recipes" ? "Recipe, output, material…" : "Equipment…"} /></label>
        <button type="button" className="equipment-action-button secondary" disabled={!actionsAvailable || Boolean(busyKey)} onClick={() => loadState()}>
          {busyKey === "state" ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {!state && actionsAvailable ? <div className="state-message compact-state">Opening your Blacksmith ledger…</div> : null}
      {!state && !actionsAvailable ? <div className="state-message compact-state">Live Blacksmith data becomes available when Crystal Guild is online.</div> : null}
      {state?.combat_locked ? <div className="moogle-combat-lock">Crafting and forging are locked while this adventurer is committed to an active encounter or raid.</div> : null}

      {state && view === "recipes" ? (
        <>
          <div className="blacksmith-summary-row">
            <span><strong>{number(state.known_recipe_count)}</strong> / {number(state.recipe_total)} recipes discovered</span>
            <span>Craft quantity is capped at 20 per action.</span>
          </div>
          <div id="blacksmith-active-panel" className="blacksmith-grid" role="tabpanel" tabIndex="0" aria-labelledby="blacksmith-tab-recipes">
            {recipes.map((recipe) => {
              const maximum = Math.max(0, Number(recipe.max_quantity || 0));
              const quantity = clampQuantity(quantities[recipe.id] ?? 1, Math.max(1, maximum));
              const busy = busyKey === `craft:${recipe.id}`;
              return (
                <article className="blacksmith-card" key={recipe.id}>
                  <div className="blacksmith-card-head">
                    <div><span className="slot-label">Recipe · Lv. {number(recipe.min_level)}</span><h3>{recipe.name}</h3></div>
                    <span className={`small-badge ${recipe.craftable ? "ready" : ""}`}>{recipe.craftable ? `Up to ${number(maximum)}` : "Missing requirements"}</span>
                  </div>
                  <div className="blacksmith-output">
                    <ItemArtwork item={recipe.output} className="blacksmith-output-artwork" />
                    <span>Creates</span>
                    <strong className={`rarity-${recipe.output?.rarity || "common"}`}>{recipe.output?.name} × {number(recipe.output?.quantity || 1)}</strong>
                    <small>Owned {number(recipe.output?.owned || 0)} · {titleCase(recipe.output?.type)}</small>
                  </div>
                  {recipe.output?.description ? <p className="blacksmith-description">{recipe.output.description}</p> : null}
                  <div className="blacksmith-costs">
                    {Number(recipe.gil_each || 0) > 0 ? <span>{number(recipe.gil_each)} Gil each</span> : null}
                    {Number(recipe.seals_each || 0) > 0 ? <span>{number(recipe.seals_each)} Seals each</span> : null}
                    {!Number(recipe.gil_each || 0) && !Number(recipe.seals_each || 0) ? <span>No currency cost</span> : null}
                  </div>
                  <div className="blacksmith-material-list">
                    {(recipe.materials || []).length ? recipe.materials.map((material) => (
                      <div className={material.enough ? "enough" : "missing"} key={material.item_id}>
                        <ItemArtwork item={{ ...material, type: "material" }} className="blacksmith-material-artwork" /><span>{material.name}</span><strong>{number(material.owned)} / {number(material.quantity)}</strong>
                      </div>
                    )) : <div className="enough"><span>No materials required</span><strong>Ready</strong></div>}
                  </div>
                  <div className="blacksmith-card-actions">
                    <label className="moogle-quantity"><span>Qty</span><input type="number" inputMode="numeric" min="1" max={Math.max(1, maximum)} value={quantityInputValue(quantities, recipe.id)} disabled={maximum < 1} onFocus={() => beginQuantityEdit(setQuantities, quantities, recipe.id)} onChange={(event) => updateQuantityInput(setQuantities, recipe.id, event.target.value, Math.max(1, maximum))} onBlur={(event) => finishQuantityEdit(setQuantities, recipe.id, event.target.value, Math.max(1, maximum))} /></label>
                    <button type="button" className="equipment-action-button" disabled={!actionsAvailable || !recipe.craftable || maximum < 1 || Boolean(busyKey)} onClick={() => craft(recipe)}>
                      {busy ? "Crafting…" : `Craft ${recipe.output?.name || recipe.name} × ${number(quantity)}`}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {!recipes.length ? <div className="state-message compact-state">No known recipes match that search.</div> : null}
        </>
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
              const typeGroups = forgeTypeGroups(group.items);
              const groupBody = (
                <div className="forge-group-body">
                  {typeGroups.map((typeGroup) => (
                    <section className="forge-type-group" key={`${group.id}-${typeGroup.type}`} aria-label={`${titleCase(typeGroup.type)} gear`}>
                      <div className="forge-type-heading">
                        <strong>{titleCase(typeGroup.type)}</strong>
                        <span>{number(typeGroup.items.length)}</span>
                      </div>
                      <div className="forge-group-grid">
                        {typeGroup.items.map((item) => {
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
                        })}
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
    </section>
  );
}
