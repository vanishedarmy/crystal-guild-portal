# v1.9.6 — Shared Lock Icon UI

Locked states now use one small gold pixel-style padlock throughout the Portal.
This frees space in Job card headings and other compact cards, badges, filters
and choices. Each icon retains a descriptive screen-reader label and hover
tooltip. Native Triple Triad select options use a text lock symbol because
native options cannot render the shared SVG.

Applied to Jobs and ability details; Guild facilities, the Expedition Board and
Airship mission requirements; travel regions and Hunt statuses; Expedition
milestones and boss controls; Dungeon cards; Chocobo Stable and registration
steps; level-gated crafting recipes; Retainer assignments; Merc recruitment,
roster and registry; locked title filters/cards; trophy cards/details;
undiscovered Bestiary tags; Chocobo race requirements; Triple Triad tables and
circuits; and the signed-out Streamer controls heading.

Unlock instructions, progress counts and useful rank, level and Core Tier
requirements remain visible. Actions keep their original disabled states and
unlock rules. No gameplay, reward, database or artwork changes are introduced.
The Triple Triad progression hotfix is included and preserved.

## Install the merge package

1. Apply to the completed v1.9.6 — Triple Triad Expanded installation.
2. Merge the included `Web/` folder into your existing `Web/` folder, replacing
   matching files and adding the new files. On a separate Web host, merge the
   contents of `Web/` into its deployment root.
3. Restart or redeploy Web and refresh the browser page. This is a frontend
   change, but **rebuilt `Web/frontend/dist/` output is included**, so you do not
   need to run npm locally. Normal source-build hosting can use its usual build.
   No Bot runtime update, restart or database migration is required.
4. Preserve your existing environment variables, private configuration,
   databases and persistent mounts.

The updated full download includes complete Bot + Web folders, artwork,
rebuilt frontend and the earlier progression fix. It needs no prior ZIP.

For an existing folder merge, superseded compiled chunks may remain. Close or
refresh old browser tabs, then optionally review them with
`python cleanup_v1_9_6.py --root PATH_TO_INSTALL`. Add `--apply` to remove only
audited files whose old hashes match, after the current installation passes the
helper's checks. The updated audit covers both the earlier v1.9.6 cleanup and
chunks superseded by this UI rebuild. A fresh full extraction is already clean.

The lock icons are vector UI elements and do not require new image assets.
