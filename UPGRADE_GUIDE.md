# Crystal Guild v1.1.16 — Arsenal Hotfix 2 Upgrade Guide

## Upgrade baseline

This package upgrades **v1.1.16 — Arsenal Hotfix 1** to **v1.1.16 — Arsenal Hotfix 2**.

Hotfix 2 is a **Web-only** queue/recovery fix. The certified Arsenal Hotfix 1 Bot remains authoritative and does not need to be replaced or restarted.

## Apply the update

1. Keep the existing Bot/worker running normally.
2. Overlay `CrystalGuild-v1.1.16-Arsenal-Hotfix2-Web-Patch-from-Hotfix1.zip` onto the current Hotfix 1 Web tree, **or** replace the Web repository with the full Hotfix 2 Web package.
3. Commit/push the Web changes to GitHub and redeploy the hosted Web service as usual.
4. Verify `/api/health` reports frontend asset revision **`1.1.16-arsenal1h2`** and Web runtime **`1.1.16-arsenal-h2`**.
5. Refresh the Adventurer Portal. Existing duplicate read-state requests are compacted automatically as new requests arrive; no queue/database cleanup command is required.

## What should recover after deployment

- Daily Guild Provisions should stop creating repeated state requests and should resume the same outstanding request after refresh.
- A delayed Daily claim can be retried safely without creating a second claim.
- Active Solo Ventures poll authoritatively while the card is open, so a late-completing round no longer leaves the UI frozen.
- Retrying the same Solo action while it is still pending resumes/reuses that request instead of creating another round action.
- State-refresh backlogs no longer block gameplay actions behind the five-action mutation limit.

## Compatibility

No migration or Bot-side update is required:

- Bot runtime remains `1.1.16-arsenal-h1`.
- Local DB schema remains **5**.
- Hosted sync schema remains **1**.
- Portal Action protocol remains **14**.
- No player reset is required.
- No new environment variable or Render secret is required.
- No new Twitch OAuth scope or reauthorization is required.
