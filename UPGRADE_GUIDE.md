# Upgrade Guide — UI Revert & Button Fit

Runtime remains `1.7.1-resynthesis-a2h5`. Local player DB schema remains **16**, hosted sync remains **1**, and Portal Action protocol remains **33**. There is no new migration and no player reset.

## If you installed the Unified PC/Mobile/SNES UI Pass

Use the incremental **Revert-from-Unified-UI Web patch** or replace the Web tree with the full Web package. The patch removes the unified UI-system stylesheet/test/audit and restores the previous design while retaining only the targeted button-fit safety layer.

The Bot does not need to change if you are already running the Gear Favorites Authority Fix Bot.

## If you never installed the Unified UI Pass

Use the smaller incremental **Button-Fit-from-Gear-Favorites-Authority Web patch**. It adds only the targeted control-fit rules and release metadata.

## Full replacement

The Complete package pairs the unchanged verified schema-16/protocol-33 Bot with the reverted/button-fit Web tree. Preserve your live database, secrets, token storage, and persistent runtime files as usual.
