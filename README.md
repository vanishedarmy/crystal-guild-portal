# Crystal Guild Web v1.1.14 — Cloud Continuity Hotfix 2

Matching website for Crystal Guild Bot `1.1.14-cloud-continuity-h2`.

Hotfix 2 updates Daily Guild Provisions from a fixed Potion description to the new randomized, level-appropriate provision system and surfaces the Bot-authoritative Twitch Tier 1/2/3 Daily perk.

Frontend asset revision: `1.1.14-continuity2`.

The Web service does **not** query Twitch's subscriber list itself and requires no new Web secret. Subscriber verification occurs in the authoritative Bot worker and only the tier/perk result is returned through the existing typed Daily Portal action.
