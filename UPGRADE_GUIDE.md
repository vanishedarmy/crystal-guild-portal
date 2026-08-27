# Upgrade Guide — iii12 Facility Supply Balance → iii13 Chocobo Portraits

This is a **paired Bot + Web update** because the portrait choice is persistent authoritative player data and is changed through a new typed Portal action.

1. Stop the Bot/worker cleanly.
2. Preserve `.env`, Twitch token storage, the live `crystal_guild.db`, and Render persistent-disk paths.
3. Make your normal manual database backup. The upgraded Bot also creates and verifies an automatic `pre_schema_6_<timestamp>.db` backup before adding the portrait field.
4. Apply the Chocobo Portrait Bot patch over the Facility Supply Balance Bot, or deploy the full Chocobo Portrait Bot package.
5. Apply the iii12 → iii13 Web patch, or replace the Web source with the full iii13 package.
6. Redeploy the Web service and restart/redeploy the Bot worker.
7. Verify `!cgversion` reports `1.1.19-retro-phase-iii-chocobo1`.
8. Verify `/api/health` reports Web runtime `1.1.19-retro-phase-iii-chocobo1`, frontend revision `1.1.19-retro-phase-iii13`, and Portal Action protocol `15`.
9. Open a registered character’s **Chocobo Stable**, choose a portrait, click **Apply Portrait**, refresh the page, and confirm the selection persists.
10. View that character from another signed-in account/read-only profile and confirm the selected portrait is visible there too.

The migration is additive. Existing players, inventories, Chocobo names, Bond XP, traits, facility progress, and all other progression are preserved.
