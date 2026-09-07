# Crystal Guild v1.7.1 — Resynthesis Alpha 2 Hotfix 4

Hotfix 4 restores useful at-a-glance information to Moogle Emporium item cards without bringing back the long flavor paragraphs removed during the compactness pass.

- Buy cards for usable items now show the canonical short effect summary.
- Sell rows show the same compact effect summary before a player disposes of an item.
- Examples include **Restores 200 HP**, **Removes Blind**, **Grants Evade for 2 rounds**, **Deals 450 Earth damage**, and **Restores All Stats**.
- The text comes from the shared item-effect formatter already used by Inventory, so Emporium and Inventory stay consistent.
- Effect copy is capped to two visual lines to preserve the compact three-column shop layout.
- Item prices, stock rotation, rarity weighting, level/job eligibility, actual effects, sell values, Gold Saucer balance, Resynthesis, and progression are unchanged.

This is Web-only. Web runtime/frontend remains `1.7.1-resynthesis-a2`; paired Bot remains `1.7.1-resynthesis-a2h3`. Local schema **15**, hosted sync **1**, Portal protocol **32**, prefix `!`. No migration or player reset.
