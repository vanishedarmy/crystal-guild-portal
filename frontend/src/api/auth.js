import { getJson } from "./client.js";

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

export async function waitForPortalAction(actionId, { attempts = 24, delayMs = 750 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const payload = await fetchPortalActions();
    const action = Array.isArray(payload.actions)
      ? payload.actions.find((entry) => entry.id === actionId)
      : null;
    if (action && (action.status === "completed" || action.status === "failed")) return action;
    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
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

export function submitStartRest(csrfToken, idempotencyKey) {
  return submitPortalAction("START_REST", {}, csrfToken, idempotencyKey);
}

export function submitFellowshipState(csrfToken, idempotencyKey) {
  return submitPortalAction("FELLOWSHIP_STATE", {}, csrfToken, idempotencyKey);
}

export function submitFellowshipGil(amount, csrfToken, idempotencyKey) {
  return submitPortalAction("CONTRIBUTE_GIL", { amount }, csrfToken, idempotencyKey);
}

export function submitFellowshipItem(itemId, quantity, csrfToken, idempotencyKey) {
  return submitPortalAction("CONTRIBUTE_ITEM", { item_id: itemId, quantity }, csrfToken, idempotencyKey);
}

export function submitCraftingState(csrfToken, idempotencyKey) {
  return submitPortalAction("CRAFTING_STATE", {}, csrfToken, idempotencyKey);
}

export function submitCraftRecipe(recipeId, quantity, csrfToken, idempotencyKey) {
  return submitPortalAction("CRAFT_RECIPE", { recipe_id: recipeId, quantity }, csrfToken, idempotencyKey);
}

export function submitForgeItem(itemId, csrfToken, idempotencyKey) {
  return submitPortalAction("FORGE_ITEM", { item_id: itemId }, csrfToken, idempotencyKey);
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

export function submitAcknowledgeAdventureResult(resultId, csrfToken, idempotencyKey) {
  return submitPortalAction("ACK_ADVENTURE_RESULT", { result_id: Number(resultId) }, csrfToken, idempotencyKey);
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
