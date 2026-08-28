Crystal Guild v1.1.19 — Retro Phase III / RC1 Hotfix 9 Web
Hosted Web runtime: 1.1.19-retro-phase-iii-rc1h9
Frontend asset revision: 1.1.19-retro-phase-iii14-rc1h9
Hosted sync schema: 1
Portal Action protocol: 19
Required Bot runtime: RC1 Hotfix 9 (protocol 19, local DB schema 7)

Hotfix 9 aligns live combat timing and Portal presentation with the authoritative Bot. Raid rallies are 90s with 60s rounds; Rally Venture joins are 60s with 30s rounds. Adventure Board countdowns are synchronized to Bot server time so a browser clock mismatch cannot make a cooldown appear ready early. Portal-origin boss spawns now publish the normal rally call to Twitch while LIVE. The OBS overlay hides immediately whenever the hosted raid state is inactive, including after victory.

Inventory & Recovery also gains a LIVE field-support target: eligible out-of-battle recovery items can be applied to another adventurer by Twitch username. Self-use remains available as before.

No local database migration or player reset is required. Deploy the paired H9 Bot because Portal Action protocol 19 and the authoritative timer/field-item behavior must match.
