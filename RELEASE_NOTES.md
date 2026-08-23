# Crystal Guild Web v1.1.14 — Cloud Continuity Hotfix 2

The signed-in Overview now presents Daily Guild Provisions as a randomized reward instead of promising a fixed Potion.

The Daily card displays:

- the current level-scaled Gil range;
- the number of randomized provision rolls;
- the detected Twitch subscriber tier when present;
- the tier's Daily Gil bonus;
- the actual authoritative claim result returned by the Bot.

The Player Guide now documents randomized Daily provisions and `!substatus`.

Subscriber-tier verification remains Bot-authoritative. The public Web service receives only the resulting perk metadata inside the existing typed Daily action result; no Twitch subscriber list or OAuth token is exposed to the browser.

Compatibility: hosted runtime `1.1.14-cloud-continuity-h2`, frontend `1.1.14-continuity2`, hosted sync schema 1, Portal Action protocol 12. No Web secret or OAuth change is required.
