# Crystal Guild — Streamer Dashboard

The broadcaster-focused read-only dashboard is available at:

```text
/streamer
```

The page is intentionally **not linked from the viewer-facing Adventurer Portal navigation**. Bookmark the direct URL on the streaming PC or second monitor.

## What it shows

- Hosted mirror / live-update state
- Registered / Ready / Resting / KO hero counts
- Average Guild level
- Searchable/filterable roster watch
- Current hero HP, level, Job, region, and boss-clear count
- Aggregated recent Guild activity
- At-a-glance leaders for level, boss clears, mastered Jobs, and achievements
- Copyable stream command reference, including owner recovery commands


## Streamer UI readability pass

The dashboard is optimized for fast second-monitor scanning rather than decorative density. The current desktop hierarchy keeps **Guild Leaders** as the only stationary reference panel above Roster Watch. **Live Ledger** is intentionally placed at the bottom of the normal scrolling workspace, after the roster and command references, because transaction history is useful context but not a permanent operational requirement. Recent Activity remains a single-column chronological feed.

The layout also includes a compact section jump bar, a labeled roster grid, visible HP bars, clearer shown/total roster counts, tighter summary cards, and a dedicated owner-command console. Hover/focus feedback stays inside card bounds so the Web Hub's clipping safeguards remain intact.

## Streamer-only Twitch commands

The dashboard mirrors the explicit `TWITCH_OWNER_ID` gates in `crystal_guild/twitch_bot.py`. There are currently **11 owner-only commands**:

| Group | Command | Purpose |
|---|---|---|
| Diagnostics | `!health` | Database, scheduler, notifier, timer-lag and combat health |
| Diagnostics | `!economy [days]` | 1–90 day gil circulation, source/sink and net-issuance pulse |
| Diagnostics | `!cgversion` | Loaded version, runtime services and source path |
| Diagnostics | `!encounterdebug` | Encounter timer, roster and notifier diagnostics |
| Diagnostics | `!directtest` | Test the direct Twitch REST announcement path |
| Player Recovery | `!readyall` | Set every recruited player to READY and restore full HP plus applicable MP/AP |
| Player Recovery | `!resettimers` | Clear Venture/Daily/Hunt cooldowns, camp timers, and personal shop refresh timers |
| Player Recovery | `!clearadventures` | Emergency-clear active field/Rally encounters, timed Hunts, and all persisted Solo Ventures |
| Encounter Recovery | `!resolveencounter` | Force the current field encounter through admin resolution |
| Encounter Recovery | `!clearencounter` | Abort and clear the current field encounter |
| Raid Control | `!spawnboss <boss name>` | Force-spawn a named raid boss |
| Raid Control | `!resolveboss` | Force resolution of the active raid/boss |

`!readyall` refuses to run while an encounter or raid is active so database HP/resources cannot diverge from live combat state. `!resettimers` resets persistent player-side timers only; active rally/round combat deadlines remain owned by the combat scheduler and are unchanged. `!clearadventures` is the emergency escape hatch for orphaned adventure state: it abandons field/Rally encounters, timed Hunts, and persisted Solo Ventures while leaving raids/world bosses, progression, inventory, and cooldowns untouched.

The hosted dashboard never executes these commands. Clicking a command only copies its text; the local Twitch Bot still validates the owner's Twitch user ID before running it.

## Security boundary

Streamer View is a **read-only presentation surface**. It does not receive or expose:

- Twitch OAuth/access/refresh tokens
- Client secrets
- `PORTAL_SYNC_KEY`
- Local Bot settings
- The authoritative `crystal_guild.db`
- Command execution authority

Its `/api/streamer` payload is derived exclusively from the same sanitized player snapshots already accepted by the hosted public mirror.

Owner commands shown in the command deck are only text references. The local Twitch Bot still validates the Twitch user ID before executing owner-only commands.

## Architecture

```text
Local Crystal Guild Bot
        |
        | sanitized schema-v1 snapshots
        v
Hosted Portal Mirror
        |
        +-- /players            Viewer registry
        +-- /player/<username>  Viewer dossiers
        +-- /guide              Player Guide
        +-- /streamer           Streamer Dashboard
        +-- /api/streamer       Sanitized aggregate dashboard payload
```

The aggregate endpoint prevents `/streamer` from issuing one profile request per player. The hosted server caches the aggregate by mirror revision, so repeated dashboard reads do not re-parse every stored snapshot when the Guild has not changed.

If SQLite experiences a transient read failure after the dashboard cache has warmed, the server may return the last good dashboard snapshot with `degraded: true` rather than making the Streamer View unusable.

## Future edits

Keep broadcaster-only styles in:

```text
frontend/src/styles/streamer.css
```

Keep the page component in:

```text
frontend/src/pages/StreamerDashboard.jsx
```

Keep aggregate/sanitization logic in `HostedPortalStore.streamer_dashboard()`.

Do not add Bot credentials, private configuration, or write/admin endpoints to the hosted dashboard. Operational actions should continue to be performed through authenticated Twitch owner commands or the local Crystal Guild control panel.
## Stationary reference strip

On wide desktop/second-monitor layouts, **Guild Leaders** is the only panel kept outside the scrolling workspace above **Roster Watch**. The page document itself remains locked in place; roster, command references, and **Live Ledger** scroll inside the workspace beneath it.

Live Ledger is intentionally placed at the bottom of that workspace, after the owner-command reference. It shows the eight newest transactions in a single chronological column and no longer uses an independent height cap or internal desktop scroll region. Tablet/mobile layouts continue to use normal document scrolling and responsive stacking.

