# Crystal Guild Web v1.1.14 — Cloud Continuity Hotfix 3a

## Jobs ability quick reference

The Adventurer Portal **Jobs** tab now mirrors the Player Guide's useful Job information instead of requiring players to leave the Portal to check abilities.

Every Job card shows:

- Attack, Signature, and primary MP/AP resource;
- Active Battle abilities with JLv. unlock, cost, target, description, and Ready/Locked state;
- passive Job milestones with JLv. unlock, description, and Learned/Locked state;
- JLv.50 cross-Job Mastery.

The Job detail dialog also adds Guide-style Combat Identity, Stat Growth, full Battle Ability reference, passive milestones, and Mastery.

## One frontend source of truth

The Portal reuses the existing versioned `guide-data.json` catalog. It does not duplicate ability definitions or expand hosted `CHARACTER_STATE` payloads, keeping the existing Portal Action result-size contract intact.

## Compatibility

Hosted runtime remains `1.1.14-cloud-continuity-h3`; frontend asset revision advances to `1.1.14-continuity3a`. Hosted sync schema 1 and Portal Action protocol 12 are unchanged. No hosted DB migration, Bot redeploy, new Web secret, or OAuth change is required.
