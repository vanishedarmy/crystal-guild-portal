# Crystal Guild v1.1.15 — Wayfarer Hotfix 2 Upgrade Guide

## Upgrade from Wayfarer Hotfix 1

Hotfix 2 is Web-only. The Wayfarer schema-5 migration is already complete on a working v1.1.15 installation and **does not run again for this hotfix**.

1. Keep the existing `1.1.15-wayfarer` Bot/runtime state unchanged.
2. Apply the **Wayfarer Hotfix 1 → Hotfix 2 Web patch**, or replace the hosted Web files with the full Hotfix 2 Web package.
3. Commit/push the Web files to GitHub and redeploy the hosted Render Web service as usual.
4. Verify Web `/api/health` reports frontend revision `1.1.15-wayfarer1h2`, runtime `1.1.15-wayfarer`, and Portal Action protocol **13**.
5. Open **Achievements & Titles → Achievements** and confirm Earned achievements appear first, active progress follows from closest completion downward, untouched goals follow from the lowest requirement upward, and hidden Secret achievements remain last.
6. Try a category and Locked filter and confirm the same ordering remains within the filtered result.

No database migration command, backup cycle, player reset, OAuth reauthorization, Render secret change, or Bot restart is introduced by Hotfix 2.

---

# Crystal Guild v1.1.15 — Wayfarer Hotfix 1 Upgrade Guide

## Upgrade from v1.1.15 Wayfarer

Hotfix 1 is Web-only. If v1.1.15 Wayfarer is already running successfully, the schema-5 migration is already complete and **does not run again for this hotfix**.

1. Keep the existing `1.1.15-wayfarer` Bot running; no Bot files or database changes are required.
2. Apply the **Wayfarer → Wayfarer Hotfix 1 Web patch**, or replace the hosted Web files with the full Hotfix 1 Web package.
3. Commit/push the Web files to GitHub and redeploy the hosted Render Web service as usual.
4. Verify Web `/api/health` reports frontend revision `1.1.15-wayfarer1h1`, runtime `1.1.15-wayfarer`, and Portal Action protocol **13**.
5. Open an Adventurer Portal profile on **Overview** and confirm the **What's New** panel appears after the Adventurer Home quick summary.
6. Confirm **Go to Adventure Board** opens Adventure Board and the notice stacks cleanly on mobile.

No database migration command, backup cycle, player reset, OAuth reauthorization, Render secret change, or Bot restart is introduced by Hotfix 1.

---

# Crystal Guild v1.1.15 — Wayfarer Upgrade Guide

Wayfarer upgrades the certified **v1.1.14 Cloud Continuity Hotfix 3c** baseline in place. Player progression is preserved.

## Upgrade from v1.1.14 Hotfix 3c

1. Stop the Crystal Guild Bot and Portal sync cleanly.
2. Preserve `.env`, `.tio.tokens.json`, `crystal_guild.db`, `/var/data/twitch_tokens.db` on cloud installs, and any other private runtime files.
3. Make your normal verified database backup before replacing program files.
4. Apply the **v1.1.14 Hotfix 3c → v1.1.15 Wayfarer Update** over the existing installation.
5. Deploy the matching Wayfarer Web files to the hosted repository/Render service.
6. Start the Bot. On first database open, schema 4 automatically migrates to schema 5.
7. Confirm a verified `backups/pre_schema_5_<timestamp>.db` was created for an existing Guild before migration.
8. Verify `!cgversion` / `!health` reports `1.1.15-wayfarer`.
9. Verify Web `/api/health` reports frontend revision `1.1.15-wayfarer1h1` and Portal Action protocol **13**.
10. Open Adventure Board and start a Solo Venture. Confirm the card either shows a Treasure result/Return choice or an interactive Encounter with **Attack / Ability / Use Item / Defend** and **Enemy intent**.
11. Clear a stage and confirm **Return to Guild** and **Press On** appear before Stage III.
12. Confirm the profile tab order begins **Overview → Adventure Board → Jobs → Equipment & Inventory**.

## Database migration

Wayfarer advances local DB schema **4 → 5**. The migration is additive and creates the `solo_expeditions` table plus an update index. Existing player, inventory, equipment, achievement, Fellowship, Chocobo, cooldown, and transaction data are not rewritten.

Before schema 5 is applied to an existing populated database, Crystal Guild automatically creates `backups/pre_schema_5_<timestamp>.db` using SQLite's backup API and verifies both `PRAGMA quick_check` and player count. If that verification fails, the migration does not proceed.

`upgrade_crystal_guild.bat` / `upgrade_crystal_guild.py` may be run explicitly after copying the update; normal Bot startup also performs the same guarded migration.

## Protocol / hosting

Portal Action protocol advances **12 → 13** because the hosted relay gains strict typed actions for one Solo Venture combat choice, Continue, Return, and Retreat. Deploy matching v1.1.15 Bot and Web code together. Hosted sync schema remains **1**.

No new Render secret or Twitch OAuth scope is introduced. If subscriber tier verification already works, no reauthorization is necessary for Wayfarer.
