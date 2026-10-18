import { clearJsonCache, getJson } from "./client.js";

export function resetPortalApiCache() {
  clearJsonCache();
}

export function fetchAuthStatus(signal) {
  return getJson("/api/auth/status", { signal });
}

export function loginUrl(returnPath = "/players") {
  return `/auth/twitch?return=${encodeURIComponent(returnPath)}`;
}

export async function logoutPortal(csrfToken) {
  return getJson("/api/auth/logout", {
    method: "POST",
    headers: {
      "X-Crystal-Guild-CSRF": csrfToken || "",
    },
  });
}

export function fetchPortalActions(signal) {
  return getJson("/api/actions", { signal });
}

export function fetchPortalAction(actionId, { waitSeconds = 0, signal } = {}) {
  const id = encodeURIComponent(String(actionId || ""));
  const wait = Math.max(0, Math.min(25, Number(waitSeconds) || 0));
  const suffix = wait > 0 ? `?wait=${encodeURIComponent(String(wait))}` : "";
  return getJson(`/api/actions/${id}${suffix}`, {
    signal,
    timeoutMs: Math.max(12000, (wait * 1000) + 5000),
  });
}

export function fetchGearFavorites(signal) {
  return getJson("/api/me/gear-favorites", { signal });
}

export function saveGearFavorites(favorites, csrfToken, idempotencyKey) {
  return getJson("/api/me/gear-favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Crystal-Guild-CSRF": csrfToken || "",
      "Idempotency-Key": idempotencyKey || "",
    },
    body: JSON.stringify({ favorites: Array.isArray(favorites) ? favorites.map(String) : [] }),
  });
}

export async function submitPortalAction(type, payload, csrfToken, idempotencyKey) {
  return getJson("/api/actions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Crystal-Guild-CSRF": csrfToken || "",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ type, payload }),
  });
}


export function submitRecruit(csrfToken, idempotencyKey) {
  return submitPortalAction("RECRUIT", {}, csrfToken, idempotencyKey);
}

export function submitPortalPing(csrfToken, idempotencyKey) {
  return submitPortalAction("PING", {}, csrfToken, idempotencyKey);
}

export function submitEquipItem(itemId, csrfToken, idempotencyKey) {
  return submitPortalAction("EQUIP_ITEM", { item_id: itemId }, csrfToken, idempotencyKey);
}

export function submitUnequipSlot(slot, csrfToken, idempotencyKey) {
  return submitPortalAction("UNEQUIP_SLOT", { slot }, csrfToken, idempotencyKey);
}

export function submitSetTitle(titleId, csrfToken, idempotencyKey) {
  return submitPortalAction("SET_TITLE", { title_id: titleId }, csrfToken, idempotencyKey);
}

export function submitCharacterState(csrfToken, idempotencyKey) {
  return submitPortalAction("CHARACTER_STATE", {}, csrfToken, idempotencyKey);
}

export function submitChangeJob(jobId, csrfToken, idempotencyKey) {
  return submitPortalAction("CHANGE_JOB", { job_id: jobId }, csrfToken, idempotencyKey);
}

export function submitSetStance(stance, csrfToken, idempotencyKey) {
  return submitPortalAction("SET_STANCE", { stance }, csrfToken, idempotencyKey);
}

export function submitSetMastery(jobId, slot, csrfToken, idempotencyKey) {
  return submitPortalAction("SET_MASTERY", { job_id: jobId, slot }, csrfToken, idempotencyKey);
}

export function submitClearMastery(slot, csrfToken, idempotencyKey) {
  return submitPortalAction("CLEAR_MASTERY", { slot }, csrfToken, idempotencyKey);
}

export function submitShopState(csrfToken, idempotencyKey) {
  return submitPortalAction("SHOP_STATE", {}, csrfToken, idempotencyKey);
}

export function submitBuyItem(itemId, quantity, csrfToken, idempotencyKey) {
  return submitPortalAction("BUY_ITEM", { item_id: itemId, quantity }, csrfToken, idempotencyKey);
}

export function submitSellItem(itemId, quantity, csrfToken, idempotencyKey) {
  return submitPortalAction("SELL_ITEM", { item_id: itemId, quantity }, csrfToken, idempotencyKey);
}

export function submitTradingPostState(csrfToken, idempotencyKey) {
  return submitPortalAction("TRADING_POST_STATE", {}, csrfToken, idempotencyKey);
}

export function submitTradingPostWatch(itemId, watched, csrfToken, idempotencyKey) {
  return submitPortalAction("TRADING_POST_WATCH", { item_id: itemId, watched }, csrfToken, idempotencyKey);
}

export function submitTradingPostHistory(itemId, csrfToken, idempotencyKey) {
  return submitPortalAction("TRADING_POST_HISTORY", { item_id: itemId }, csrfToken, idempotencyKey);
}

export function submitTradingPostList(itemId, quantity, unitPrice, csrfToken, idempotencyKey) {
  return submitPortalAction("TRADING_POST_LIST", { item_id: itemId, quantity, unit_price: unitPrice }, csrfToken, idempotencyKey);
}

export function submitTradingPostBuy(listingId, csrfToken, idempotencyKey) {
  return submitPortalAction("TRADING_POST_BUY", { listing_id: listingId }, csrfToken, idempotencyKey);
}

export function submitTradingPostCancel(listingId, csrfToken, idempotencyKey) {
  return submitPortalAction("TRADING_POST_CANCEL", { listing_id: listingId }, csrfToken, idempotencyKey);
}

export async function waitForPortalAction(actionId, { attempts = 24, delayMs = 750, signal } = {}) {
  const budgetMs = Math.max(1000, (Number(attempts) || 24) * Math.max(100, Number(delayMs) || 750));
  const deadline = Date.now() + budgetMs;
  let singleActionSupported = true;
  while (Date.now() < deadline) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const remainingMs = Math.max(1, deadline - Date.now());
    try {
      if (singleActionSupported) {
        const waitSeconds = Math.max(1, Math.min(20, Math.floor(remainingMs / 1000)));
        const payload = await fetchPortalAction(actionId, { waitSeconds, signal });
        const action = payload?.action || null;
        if (action && (action.status === "completed" || action.status === "failed")) return action;
        continue;
      }
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      if (!/not found|404/i.test(String(error?.message || ""))) throw error;
      singleActionSupported = false;
    }
    const payload = await fetchPortalActions(signal);
    const action = Array.isArray(payload.actions)
      ? payload.actions.find((entry) => entry.id === actionId)
      : null;
    if (action && (action.status === "completed" || action.status === "failed")) return action;
    await new Promise((resolve) => window.setTimeout(resolve, Math.min(delayMs, Math.max(1, deadline - Date.now()))));
  }
  return null;
}

export function submitRecoveryState(csrfToken, idempotencyKey) {
  return submitPortalAction("RECOVERY_STATE", {}, csrfToken, idempotencyKey);
}

export function submitUseFieldItem(itemId, csrfToken, idempotencyKey, targetUsername = "") {
  const payload = { item_id: itemId };
  const target = String(targetUsername || "").trim().replace(/^@/, "").toLowerCase();
  if (target) payload.target_username = target;
  return submitPortalAction("USE_FIELD_ITEM", payload, csrfToken, idempotencyKey);
}

export function submitCampMeal(csrfToken, idempotencyKey) {
  return submitPortalAction("CAMP_EAT_MEAL", {}, csrfToken, idempotencyKey);
}

export function submitCampPreparation(preparation, csrfToken, idempotencyKey) {
  return submitPortalAction("CAMP_SET_PREPARATION", { preparation }, csrfToken, idempotencyKey);
}

export function submitStartRest(csrfToken, idempotencyKey) {
  return submitPortalAction("START_REST", {}, csrfToken, idempotencyKey);
}

export function submitFellowshipState(csrfToken, idempotencyKey) {
  return submitPortalAction("FELLOWSHIP_STATE", {}, csrfToken, idempotencyKey);
}

export function submitFellowshipGil(amount, projectId, csrfToken, idempotencyKey) {
  return submitPortalAction("CONTRIBUTE_GIL", { amount, project_id: projectId }, csrfToken, idempotencyKey);
}

export function submitFellowshipItem(itemId, quantity, projectId, csrfToken, idempotencyKey) {
  return submitPortalAction("CONTRIBUTE_ITEM", { item_id: itemId, quantity, project_id: projectId }, csrfToken, idempotencyKey);
}

export function submitWorkshopExchange(exchangeId, batches, csrfToken, idempotencyKey) {
  return submitPortalAction("WORKSHOP_EXCHANGE", { exchange_id: exchangeId, batches }, csrfToken, idempotencyKey);
}

export function submitCraftingState(csrfToken, idempotencyKey, mode = "legacy") {
  return submitPortalAction("CRAFTING_STATE", mode === "reforged" ? { mode } : {}, csrfToken, idempotencyKey);
}

export function submitCraftRecipe(recipeId, quantity, csrfToken, idempotencyKey) {
  return submitPortalAction("CRAFT_RECIPE", { recipe_id: recipeId, quantity }, csrfToken, idempotencyKey);
}

export function submitForgeItem(itemId, csrfToken, idempotencyKey) {
  return submitPortalAction("FORGE_ITEM", { item_id: itemId }, csrfToken, idempotencyKey);
}

export function submitResynthesizeItem(itemId, csrfToken, idempotencyKey) {
  return submitPortalAction("RESYNTHESIZE_ITEM", { item_id: itemId }, csrfToken, idempotencyKey);
}

export function submitGoldSaucerState(csrfToken, idempotencyKey) {
  return submitPortalAction("GOLD_SAUCER_STATE", {}, csrfToken, idempotencyKey);
}

export function submitCactpotStart(csrfToken, idempotencyKey) {
  return submitPortalAction("CACTPOT_START", {}, csrfToken, idempotencyKey);
}

export function submitCactpotReveal(cell, csrfToken, idempotencyKey) {
  return submitPortalAction("CACTPOT_REVEAL", { cell: Number(cell) }, csrfToken, idempotencyKey);
}

export function submitCactpotLine(line, csrfToken, idempotencyKey) {
  return submitPortalAction("CACTPOT_LINE", { line: Number(line) }, csrfToken, idempotencyKey);
}

export function submitSlotsSpin(csrfToken, idempotencyKey) {
  return submitPortalAction("SLOTS_SPIN", {}, csrfToken, idempotencyKey);
}

export function submitMonsterTossStart(csrfToken, idempotencyKey) {
  return submitPortalAction("MONSTER_TOSS_START", {}, csrfToken, idempotencyKey);
}

export function submitMonsterTossThrow(target, style, csrfToken, idempotencyKey) {
  return submitPortalAction("MONSTER_TOSS_THROW", { target: String(target || ""), style: String(style || "") }, csrfToken, idempotencyKey);
}

export function submitChocoboRace(course, strategy, csrfToken, idempotencyKey) {
  return submitPortalAction("CHOCOBO_RACE", { course: String(course || ""), strategy: String(strategy || "") }, csrfToken, idempotencyKey);
}

export function submitTriadState(csrfToken, idempotencyKey) {
  return submitPortalAction("TRIAD_STATE", {}, csrfToken, idempotencyKey);
}

export function submitTriadSetDeck(cards, csrfToken, idempotencyKey) {
  return submitPortalAction("TRIAD_SET_DECK", { cards: Array.isArray(cards) ? cards.map((value) => String(value || "")) : [] }, csrfToken, idempotencyKey);
}

export function submitTriadStart(opponent, csrfToken, idempotencyKey) {
  return submitPortalAction("TRIAD_START", { opponent: String(opponent || "") }, csrfToken, idempotencyKey);
}

export function submitTriadPlay(card, cell, csrfToken, idempotencyKey) {
  return submitPortalAction("TRIAD_PLAY", { card: String(card || ""), cell: Number(cell) }, csrfToken, idempotencyKey);
}

export function submitSaucerBuy(prizeId, csrfToken, idempotencyKey) {
  return submitPortalAction("SAUCER_BUY", { prize_id: String(prizeId || "") }, csrfToken, idempotencyKey);
}

export function submitMercState(csrfToken, idempotencyKey) {
  return submitPortalAction("MERC_STATE", {}, csrfToken, idempotencyKey);
}

export function submitMercRecruit(heroId, csrfToken, idempotencyKey) {
  return submitPortalAction("MERC_RECRUIT", { hero_id: String(heroId || "") }, csrfToken, idempotencyKey);
}

export function submitMercHire(heroId, missionType, csrfToken, idempotencyKey) {
  return submitPortalAction("MERC_HIRE", { hero_id: String(heroId || ""), mission_type: String(missionType || "") }, csrfToken, idempotencyKey);
}

export function submitMercCancel(missionType, csrfToken, idempotencyKey) {
  const mission = String(missionType || "").trim().toLowerCase();
  return submitPortalAction("MERC_CANCEL", mission ? { mission_type: mission } : {}, csrfToken, idempotencyKey);
}

export function submitRetainerState(csrfToken, idempotencyKey) {
  return submitPortalAction("RETAINER_STATE", {}, csrfToken, idempotencyKey);
}

export function submitRetainerDispatch(assignment, priority, csrfToken, idempotencyKey) {
  return submitPortalAction("RETAINER_DISPATCH", { assignment: String(assignment || ""), priority: String(priority || "") }, csrfToken, idempotencyKey);
}

export function submitRetainerCollect(csrfToken, idempotencyKey) {
  return submitPortalAction("RETAINER_COLLECT", {}, csrfToken, idempotencyKey);
}

export function submitDailyState(csrfToken, idempotencyKey) {
  return submitPortalAction("DAILY_STATE", {}, csrfToken, idempotencyKey);
}

export function submitClaimDaily(csrfToken, idempotencyKey) {
  return submitPortalAction("CLAIM_DAILY", {}, csrfToken, idempotencyKey);
}

export function submitAdventureState(csrfToken, idempotencyKey) {
  return submitPortalAction("ADVENTURE_STATE", {}, csrfToken, idempotencyKey);
}

export function submitLiveEventJoin(event, eventId, csrfToken, idempotencyKey) {
  return submitPortalAction("LIVE_EVENT_JOIN", { event, event_id: eventId }, csrfToken, idempotencyKey);
}

export function submitLiveEventAction(event, eventId, round, kind, choice, targetUsername, csrfToken, idempotencyKey) {
  const payload = { event, event_id: eventId, round: Number(round), kind };
  if (choice) payload.choice = choice;
  if (targetUsername) payload.target_username = targetUsername;
  return submitPortalAction("LIVE_EVENT_ACTION", payload, csrfToken, idempotencyKey);
}

export function submitTravelRegion(regionId, csrfToken, idempotencyKey) {
  return submitPortalAction("TRAVEL_REGION", { region_id: regionId }, csrfToken, idempotencyKey);
}

export function submitSoloVenture(csrfToken, idempotencyKey) {
  return submitPortalAction("SOLO_VENTURE", {}, csrfToken, idempotencyKey);
}

export function submitSoloExpeditionAction(action, csrfToken, idempotencyKey) {
  return submitPortalAction("SOLO_EXPEDITION_ACTION", { action }, csrfToken, idempotencyKey);
}

export function submitSoloExpeditionContinue(csrfToken, idempotencyKey) {
  return submitPortalAction("SOLO_EXPEDITION_CONTINUE", {}, csrfToken, idempotencyKey);
}

export function submitSoloExpeditionReturn(csrfToken, idempotencyKey) {
  return submitPortalAction("SOLO_EXPEDITION_RETURN", {}, csrfToken, idempotencyKey);
}

export function submitSoloExpeditionRetreat(csrfToken, idempotencyKey) {
  return submitPortalAction("SOLO_EXPEDITION_RETREAT", {}, csrfToken, idempotencyKey);
}

export function submitChallengeHunt(huntId, csrfToken, idempotencyKey) {
  return submitPortalAction("CHALLENGE_HUNT", { hunt_id: huntId }, csrfToken, idempotencyKey);
}

export function submitDungeonStart(dungeonId, csrfToken, idempotencyKey) {
  return submitPortalAction("DUNGEON_START", { dungeon_id: dungeonId }, csrfToken, idempotencyKey);
}

export function submitDungeonAction(runId, roomId, revision, action, csrfToken, idempotencyKey) {
  return submitPortalAction("DUNGEON_ACTION", { run_id: runId, room_id: roomId, revision: Number(revision), action }, csrfToken, idempotencyKey);
}

export function submitDungeonContinue(runId, roomId, revision, csrfToken, idempotencyKey) {
  return submitPortalAction("DUNGEON_CONTINUE", { run_id: runId, room_id: roomId, revision: Number(revision) }, csrfToken, idempotencyKey);
}

export function submitDungeonChoice(runId, roomId, revision, choiceId, csrfToken, idempotencyKey) {
  return submitPortalAction("DUNGEON_CHOICE", { run_id: runId, room_id: roomId, revision: Number(revision), choice_id: choiceId }, csrfToken, idempotencyKey);
}

export function submitDungeonRetreat(runId, roomId, revision, csrfToken, idempotencyKey) {
  return submitPortalAction("DUNGEON_RETREAT", { run_id: runId, room_id: roomId, revision: Number(revision) }, csrfToken, idempotencyKey);
}

export function submitAcknowledgeAdventureResult(resultId, csrfToken, idempotencyKey) {
  return submitPortalAction("ACK_ADVENTURE_RESULT", { result_id: Number(resultId) }, csrfToken, idempotencyKey);
}

export function submitExpeditionStart(regionId, depth, csrfToken, idempotencyKey) {
  return submitPortalAction("EXPEDITION_START", { region_id: regionId, depth }, csrfToken, idempotencyKey);
}

export function submitExpeditionResolveStage(csrfToken, idempotencyKey) {
  return submitPortalAction("EXPEDITION_RESOLVE_STAGE", {}, csrfToken, idempotencyKey);
}

export function submitExpeditionAction(action, csrfToken, idempotencyKey) {
  return submitPortalAction("EXPEDITION_ACTION", { action }, csrfToken, idempotencyKey);
}

export function submitExpeditionContinue(route, csrfToken, idempotencyKey) {
  return submitPortalAction("EXPEDITION_CONTINUE", { route }, csrfToken, idempotencyKey);
}

export function submitExpeditionCamp(csrfToken, idempotencyKey) {
  return submitPortalAction("EXPEDITION_CAMP", {}, csrfToken, idempotencyKey);
}

export function submitExpeditionReturn(csrfToken, idempotencyKey) {
  return submitPortalAction("EXPEDITION_RETURN", {}, csrfToken, idempotencyKey);
}

export function submitExpeditionRetreat(csrfToken, idempotencyKey) {
  return submitPortalAction("EXPEDITION_RETREAT", {}, csrfToken, idempotencyKey);
}

export function submitChocoboState(csrfToken, idempotencyKey) {
  return submitPortalAction("CHOCOBO_STATE", {}, csrfToken, idempotencyKey);
}

export function submitCompleteChocoboQuest(csrfToken, idempotencyKey) {
  return submitPortalAction("COMPLETE_CHOCOBO_QUEST", {}, csrfToken, idempotencyKey);
}

export function submitPurchaseChocoboWrit(csrfToken, idempotencyKey) {
  return submitPortalAction("PURCHASE_CHOCOBO_WRIT", {}, csrfToken, idempotencyKey);
}

export function submitRegisterChocobo(name, csrfToken, idempotencyKey) {
  return submitPortalAction("REGISTER_CHOCOBO", { name }, csrfToken, idempotencyKey);
}

export function submitRenameChocobo(name, csrfToken, idempotencyKey) {
  return submitPortalAction("RENAME_CHOCOBO", { name }, csrfToken, idempotencyKey);
}

export function submitSetChocoboPortrait(portraitId, csrfToken, idempotencyKey) {
  return submitPortalAction("SET_CHOCOBO_PORTRAIT", { portrait_id: portraitId }, csrfToken, idempotencyKey);
}

export function submitStreamerCommand(command, argument, csrfToken, idempotencyKey) {
  const payload = { command };
  if (argument !== undefined && argument !== null && String(argument).trim() !== "") payload.argument = argument;
  return submitPortalAction("STREAMER_COMMAND", payload, csrfToken, idempotencyKey);
}

export function submitSeasonalState(csrfToken, idempotencyKey) {
  return submitPortalAction("SEASONAL_STATE", {}, csrfToken, idempotencyKey);
}

export function submitSeasonalBuy(rewardId, csrfToken, idempotencyKey) {
  return submitPortalAction("SEASONAL_BUY", { reward_id: String(rewardId || "") }, csrfToken, idempotencyKey);
}
