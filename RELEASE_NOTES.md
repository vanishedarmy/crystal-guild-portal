# Crystal Guild v1.1.15 — Wayfarer — Hotfix 2

Hotfix 2 reorganizes the Adventurer Portal **Achievements** gallery around what is most useful to the player right now. Achievement definitions, rewards, unlock conditions, points, titles, and saved progression are unchanged.

## Achievement progression order

Achievement cards now sort automatically after the existing category and attainment filters:

1. **Earned** achievements appear first and read from the smallest/easiest requirement upward.
2. **In Progress** achievements follow, ordered by highest completion percentage first. Ties favor the goal with the least work remaining, then the lower requirement.
3. **Not Started** achievements follow in ascending requirement order.
4. **Secret** unearned achievements remain last because their target/progress is intentionally hidden.

This keeps tier chains in a natural progression such as **10 → 25 → 50** instead of exposing the underlying data order. The same ordering is preserved inside category and Locked/Unlocked filters. Achievement cards also distinguish **In Progress** from **Not Started** in the progress label.

## Compatibility

- Bot/Web runtime: `1.1.15-wayfarer`
- Frontend asset revision: `1.1.15-wayfarer1h2`
- Local DB schema: **5**
- Hosted sync schema: **1**
- Portal Action protocol: **13**
- Twitch prefix: `!`

This is a **Web presentation hotfix only**. No database migration, player reset, Bot replacement/restart, new Render secret, hosted sync change, Portal protocol change, or Twitch OAuth change is required.

---

# Crystal Guild v1.1.15 — Wayfarer — Hotfix 1

Hotfix 1 adds a reusable, player-facing **What's New** section to the Adventurer Portal Overview. The latest major update is shown near the top of the character home so players can quickly understand what changed without reading developer release notes.

## What's New — Wayfarer

The first featured entry explains the interactive Solo Venture in plain player language:

- choose each encounter turn with **Attack / Ability / Use Item / Defend**;
- **Return to Guild** to bank spoils or **Press On** through up to three stages;
- HP, MP/AP, statuses, and consumed items carry forward while pressing deeper;
- every stage uses the new **60% Encounter / 40% Treasure** split;
- Solo Venture has no battle timer and waits for the player even after leaving or refreshing the Portal.

The panel includes a direct **Go to Adventure Board** action. The content is driven by a reusable major-update list so future major releases can be added to the same section, with the newest entry featured automatically and older entries available as update history.

The layout collapses cleanly on mobile and preserves keyboard/focus accessibility.

## Compatibility

- Bot/Web runtime: `1.1.15-wayfarer`
- Frontend asset revision: `1.1.15-wayfarer1h1`
- Local DB schema: **5**
- Hosted sync schema: **1**
- Portal Action protocol: **13**
- Twitch prefix: `!`

This is a **Web presentation hotfix only**. No database migration, player reset, Bot replacement, new Render secret, hosted sync change, Portal protocol change, or Twitch OAuth change is required.

---

# Crystal Guild v1.1.15 — Wayfarer

Wayfarer turns the Portal-only **Solo Venture** into a compact, interactive RPG run while preserving Rally Venture as Crystal Guild's higher-risk live-stream cooperative mode. It also reorganizes the Adventurer Portal so the most frequently used character actions appear first.

## Interactive Solo Venture

- Solo Venture remains Portal-only and now resolves **one player-selected combat round at a time**.
- Battle controls are **Attack**, **Ability**, **Use Item**, and **Defend**.
- The current enemy intent is shown before the player's choice so defensive and resource decisions can react to incoming attacks or specials.
- Ability choices show learned/unlocked state, MP/AP cost, target, and description.
- Battle inventory shows eligible owned consumables and quantities.
- HP, MP, AP, statuses, and consumed items persist through the run.
- Solo combat is player-paced: there is **no round timer** and no autonomous scheduler advance while waiting for the next Portal action.

## Three-stage Wayfarer run

Every stage rolls **60% Encounter / 40% Treasure**. A run ends after at most three stages.

- **Stage I:** normal Solo rewards.
- **Stage II:** +15% XP / JP / Gil from encounter rewards.
- **Stage III:** +30% XP / JP / Gil from encounter rewards.
- Deeper Treasure events keep the same 40% event chance but bias the chest toward better rarity.
- Solo enemies are selected roughly from **two levels below through three levels above** the hero, with deeper stages weighting the stronger end of that range more heavily.

After Stage I or II is cleared, the player chooses:

- **Return to Guild — Bank Spoils:** safely ends the run and awards unbanked Gil/items.
- **Press On:** carries current HP/MP/AP and consumed inventory forward into the next stage for better reward potential.

XP and JP from defeated enemies are secured immediately. Encounter Gil and ordinary item drops remain **Venture Spoils** until banked. Rare pity drops and recipe discoveries remain secured progression rewards.

If the hero is defeated, secured XP/JP and secured progression loot remain, **50% of unbanked Gil is recovered**, and loose item spoils are lost. Retreating from combat preserves secured progression but abandons all unbanked Venture Spoils.

## Independent persistent Solo state

Interactive Solo Ventures no longer borrow the Guild-wide live encounter slot as their authoritative state. Each active run is persisted per player in the local database. This means a player may leave the Portal and return later without a timer advancing their fight, and an unattended Solo Venture does not block unrelated Rally Ventures or Hunts for the Guild.

While a Solo Venture is active, build/recovery/economy mutations that could bypass the run's resource pressure—such as changing Jobs, re-equipping, resting, field-item use, shopping, crafting, or forging—are blocked until the player Returns or Retreats. Battle items remain usable through the Solo Venture combat interface.

## Portal navigation order

Profile tabs now prioritize the normal player journey:

1. Overview
2. Adventure Board
3. Jobs
4. Equipment & Inventory
5. Moogle Emporium
6. Blacksmith
7. Chocobo Stable
8. Fellowship
9. Bestiary
10. Relics
11. Achievements & Titles
12. Records
13. Trophy Hall

## Compatibility and migration

- Bot/Web runtime: `1.1.15-wayfarer`
- Frontend asset revision: `1.1.15-wayfarer1h1`
- Local DB schema: **5** (from 4)
- Hosted sync schema: **1**
- Portal Action protocol: **13** (from 12)
- Twitch prefix: `!`

Schema 5 adds only the persistent per-player Solo Venture state table. When an existing schema-4 Guild database is opened, Crystal Guild automatically creates and verifies `backups/pre_schema_5_<timestamp>.db` before applying the additive migration. Existing progression is preserved.

No player reset, new Render secret, hosted sync schema change, or new Twitch OAuth scope is required. The existing `channel:read:subscriptions` broadcaster authorization remains required only for the subscriber perks introduced previously.
