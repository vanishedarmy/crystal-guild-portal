# Crystal Guild v1.1.16 — Arsenal Hotfix 3

## Solo Venture state delivery fix

Hotfix 3 fixes an Adventure Board failure that could leave a persisted Solo Venture active on the Bot while the browser showed an empty READY-style card with Begin Solo Venture disabled. The same hidden run could still block Daily Guild Provisions, producing the contradictory message to return or retreat from a Solo Venture that was not visible on the board.

Arsenal's larger Hunt catalog, expanded Job ability data, and a stocked player's battle-item list can make an authoritative Adventure Board result exceed the previous 16 KiB relay result ceiling. The Bot could calculate the correct state, but the hosted relay could reject the completed result before the browser received it.

The Web relay now keeps the strict 16 KiB limit for browser-submitted action payloads while allowing authoritative Bot results up to a separately bounded 64 KiB limit. This preserves the request-side security boundary while giving the richer Adventure Board enough room to return an active Solo Venture safely.

The Adventure Board also now:
- retries its initial authoritative state request every five seconds while the board has not loaded;
- reuses the same in-flight state request rather than generating duplicate queue entries;
- shows **Checking your venture…** / **Checking** until authoritative state arrives instead of falsely displaying READY;
- keeps Begin Solo Venture disabled until the board has a confirmed state.

Existing persisted Solo Ventures are not reset. Once the updated Web deployment receives the authoritative state, the current combat/choice stage should reappear and can continue normally.

## Compatibility

- Bot runtime: `1.1.16-arsenal-h1` (unchanged)
- Hosted Web runtime: `1.1.16-arsenal-h3`
- Frontend asset revision: `1.1.16-arsenal1h3`
- Local DB schema: 5 (unchanged)
- Hosted sync schema: 1 (unchanged)
- Portal Action protocol: 14 (unchanged)
- Twitch prefix: `!`

This is a Web-only hotfix. No database migration, player reset, Bot replacement/restart, OAuth change, or new Render secret is required.
