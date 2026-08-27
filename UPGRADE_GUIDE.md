# Upgrade Guide — RC1 Hotfix 4 Relic Refresh + Dynamic Camp

1. Back up the current Web deployment and local Bot database/configuration.
2. Deploy the full RC1H4 Web package, or apply the `rc1h3 -> rc1h4` Web patch.
3. Apply the paired RC1H4 Bot package/patch. The Web UI can describe the new Camp rule, but the Bot is the authoritative timer owner.
4. Restart/redeploy the Bot and Web normally. No migration command is required.
5. Hard-refresh the Portal once so asset revision `1.1.19-retro-phase-iii14-rc1h4` is loaded.
6. Verify one Relic at each stage, then test Camp while Twitch is OFFLINE (1-hour base) and LIVE (15-minute base). Existing Fellowship Camp-time reductions may shorten the displayed effective timer.

No database reset, OAuth change, or new environment variable is required.
