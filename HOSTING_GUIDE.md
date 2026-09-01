# Hosting Guide — Gold Saucer Alpha 5

Deploy this full Web tree with the matching Alpha 5 Bot runtime. Preserve hosted secrets and persistent state. `/api/health` should report hosted runtime `1.6.0-gold-saucer-a5`, frontend asset revision `1.6.0-gold-saucer-a5`, hosted sync schema 1, and Portal protocol 29.

Deploy Alpha 5 Bot and Web as a matched protocol-29 pair because Triple Triad introduces three new Portal actions. Canonical MGP fields and legacy balance aliases remain compatible. The Bot performs the additive local schema 12→13 migration; the hosted sync schema remains 1.
