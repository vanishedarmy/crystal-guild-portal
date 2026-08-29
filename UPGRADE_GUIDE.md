# Upgrade Guide — Expeditions Beta 2 Hotfix 2 → Beta 3

Beta 3 is a **Web-only** Mobile & Accessibility Polish release. The existing Beta 1 Bot remains compatible.

1. Back up the deployed Web tree as normal.
2. Apply `CrystalGuild-v1.2.0-Expeditions-Beta3-Web-Patch-B2H2-to-B3.zip` over the current Beta 2 Hotfix 2 Web deployment, or deploy the full Beta 3 Web package.
3. Redeploy the hosted Web service.
4. Keep the existing `1.2.0-expeditions-b1` Bot running.
5. Hard-refresh once so frontend asset revision `1.2.0-expeditions-b3` is loaded.
6. On a phone/narrow browser, verify the compact header, Profile section selector, Adventure Board actions, detail dialog, Moogle/Blacksmith tabs, and Player Guide controls.
7. With a keyboard, verify Arrow/Home/End navigation in desktop Profile tabs and the Moogle/Blacksmith tab controls.

No database migration, player reset, OAuth reconfiguration, new environment variable, hosted sync change, or Portal protocol change is required.
