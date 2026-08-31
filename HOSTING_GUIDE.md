# Hosting Guide — Gold Saucer Alpha 2 Web Hotfix 1

Deploy this Web hotfix with the existing `1.6.0-gold-saucer-a2` Bot. Preserve hosted secrets and persistent state. No Bot replacement or database migration is required.

After deployment, `/api/health` should report hosted runtime `1.6.0-gold-saucer-a2`, frontend asset revision `1.6.0-gold-saucer-a2h1`, hosted sync schema 1, and Portal protocol 27. Monster Toss actions remain Bot-authoritative and the Portal Trial & Raid Board remains read-only.
