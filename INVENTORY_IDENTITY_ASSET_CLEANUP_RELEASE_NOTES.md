# Crystal Guild v1.1.18 — Inventory Identity Asset Cleanup Hotfix

This Web-only asset hotfix advances the frontend asset revision to `1.1.18-retro-phase-ii33` and rebuilds the shared Inventory Identity artwork extraction used by the ii32 equipment/material pass.

## Fix
The ii32 sprite-sheet extraction could remove dark interior pixels and thin details while trying to make generated sheet backgrounds transparent. That could leave some armor, weapons, and accessories looking fragmented or corrupted even though the generated source sheet itself was valid.

The full shared Phase 2 art set has been re-extracted with a safer background model and tighter per-cell isolation. The replacement pass preserves dark silhouettes, thin metallic edges, paired pieces such as boots/gauntlets, and transparency while preventing neighboring-cell bleed.

## Artwork revalidated
- 20 ore/metal family icons.
- 8 elemental/magical crystal icons.
- 12 weapon-family base icons.
- 36 weapon-tier variants.
- 36 armor-tier variants.
- 24 armor/accessory family variants.
- Existing 32 consumable icons remain unchanged and were retained after audit.

The Web package still carries **168 Inventory Identity assets** total. This hotfix changes extraction quality only; item-to-art mappings and gameplay behavior are unchanged.

## Compatibility
- Frontend asset revision: `1.1.18-retro-phase-ii33`
- Compatible Bot runtime: `1.1.18-recovery-h1`
- Local DB schema: 5 unchanged
- Hosted sync schema: 1 unchanged
- Portal Action protocol: 14 unchanged
- Twitch prefix: `!` unchanged

No database migration, Bot update, OAuth change, environment-variable change, or player reset is required.
