# Crystal Guild v1.1.18 — Inventory Identity Pass: Phase 1

Frontend asset revision: `1.1.18-retro-phase-ii31`.

This Web-only visual update packages the first 32 consumable item icons generated in Waves 1, 2, 3A, and 3B. Every canonical consumable in the current item catalog now has a 256×256 transparent WebP icon.

Artwork is wired into:
- usable-now Recovery actions;
- Inventory consumable cards;
- Moogle Emporium buy/sell identity where applicable;
- item detail dialogs;
- Player Guide item catalog rows.

The item-art mapping is intentionally reusable so later material, weapon, armor, and accessory phases can extend the same system without changing gameplay data.

No Bot change, database migration, hosted sync schema change, Portal Action protocol change, OAuth change, environment variable, or player reset is required. Bot runtime remains `1.1.18-recovery-h1`.
