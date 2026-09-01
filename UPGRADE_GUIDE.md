# Upgrade Guide — v1.6.0 Gold Saucer Alpha 5

Supported source: canonical Alpha 4 Chocobo Racing / Web H1.

1. Preserve the live database, `.env`, Twitch token storage, hosted secrets, and persistent-disk state.
2. Deploy the matching Alpha 5 Bot and Web packages together.
3. Restart the Bot first. It performs the additive schema **12 → 13** migration and creates a verified `pre_schema_13_<timestamp>.db` backup.
4. Redeploy/restart the Web relay.
5. Verify `/api/health` reports hosted runtime/frontend `1.6.0-gold-saucer-a5`, hosted sync 1, and Portal protocol 29.
6. Open Gold Saucer and verify the existing MGP balance is unchanged.
7. Confirm Mini Cactpot and Crystal Slots are always open; all other Gold Saucer content panels are collapsible.
8. Open Triple Triad, confirm the starter five-card deck, save a deck, start a Saucer Attendant match, play a card, refresh, and confirm the exact match resumes.

No player reset, MGP conversion, OAuth change, or new required environment variable is needed.
