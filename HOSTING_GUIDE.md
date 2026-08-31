# Hosting Guide — Gold Saucer Alpha 3 — MGP

Deploy this full Web tree with the matching Alpha 3 Bot runtime. Preserve hosted secrets and persistent state. `/api/health` should report hosted runtime `1.6.0-gold-saucer-a3`, frontend asset revision `1.6.0-gold-saucer-a3`, hosted sync schema 1, and Portal protocol 27.

A staggered rollout is safe: the Alpha 3 Web prefers canonical MGP fields and falls back to Alpha 2 balance aliases, while the Alpha 3 Bot continues exposing legacy aliases temporarily.
