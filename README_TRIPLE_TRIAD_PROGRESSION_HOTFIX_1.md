# v1.9.6 — Triple Triad Expanded: Progression Hotfix 1

The hosted Web service still validated challenges against the three original
opponent IDs. It rejected Chocobo Breeder and six other expanded opponents
before the request reached the Bot, preventing the first circuit from clearing.

Web now validates opponent IDs from its bundled copy of the authoritative
Bot Triple Triad catalog. Both deployment services have identical catalogs.
The Bot continues enforcing circuit unlocks, entry limits, deck ownership,
active matches and MGP costs. Gameplay values and rewards are unchanged.

## Apply the small merge package

1. Use this patch on the completed **v1.9.6 — Triple Triad Expanded** build.
2. Merge `Web/` into your existing Web folder, replacing matching files and
   adding `Web/crystal_guild/triple_triad_catalog.json`. Copy this JSON alongside
   `hosted_portal.py`; both are required. If hosted separately, merge the contents
   of `Web/` into the Web service's deployment root.
3. Restart or redeploy the **Web service**, then refresh the player page.
   **No npm rebuild and no Bot runtime update or restart is required.**
   Existing Dockerfiles copy the entire `crystal_guild` directory, including
   the added catalog. A normal source-build deployment may still run its usual
   npm build; the included frontend remains compatible.
4. Choose Chocobo Breeder from Triple Triad's Opponent selector or Opponents
   tab. Win once against both beginner opponents to open the Bronze circuit.
   Continue selecting the next unlocked table; changing opponents is explicit.

Keep existing private configuration, databases and persistent mounts. There is
no schema migration or progress reset. Cards, decks, wins, active matches and
claimed bonuses are preserved. The optional Bot regression test in this patch
does not change Bot runtime behavior.

The corrected full download already includes this hotfix. Its `Bot/`, `Web/`,
artwork and built frontend are complete; it requires no earlier download.

## Validation

- Reproduced the original rejection of all seven expanded opponent IDs.
- Three new Web tests pass: all ten opponents queue and lease successfully,
  normalization and retries are preserved, invalid IDs/extra fields rejected.
- Two combined-service tests pass through authenticated player HTTP requests,
  real Web claims/results and the Bot action worker: all ten tables, five
  circuit clears, one-time bonuses, locked tables and the daily limit.
  Finished-board fixtures isolate progression from NPC move randomness.
- Ten existing Triple Triad gameplay tests, 33 hosted portal tests and 33
  Portal action tests pass: **81 tests total**.
- Both catalog files are byte-identical and included by the existing Docker
  copy rules. The frontend and all artwork are unchanged.

Run the new Web tests from `Web/`:
`PYTHONPATH=. python -m unittest discover -s tests -p test_triple_triad_expanded_actions.py -v`

Run the combined regression from `Bot/` with `Web/` beside it:
`PYTHONPATH=. python -m unittest discover -s tests -p test_triple_triad_hosted_ladder.py -v`
