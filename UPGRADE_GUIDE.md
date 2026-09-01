# Upgrade Guide — Alpha 5 Web Hotfix 6

1. Keep the existing **H5 Bot** running; there is no Bot update in H6.
2. Deploy the H6 Web tree or apply the H5→H6 Web patch.
3. Preserve hosted secrets, environment variables, and persistent data.
4. Hard-refresh once after deployment so the frontend revision advances to `1.6.0-gold-saucer-a5h6`.
5. Open Gold Saucer → Triple Triad and confirm **Choose Opponent** goes directly into the three opponent cards with no wide banner image.
6. Confirm opponent cards remain readable at desktop and mobile widths and the selected opponent displays **SELECTED**.
7. Confirm `/api/health` reports runtime `1.6.0-gold-saucer-a5h5`, frontend `1.6.0-gold-saucer-a5h6`, hosted sync **1**, and Portal protocol **29**.

No database migration, MGP conversion, card reset, or OAuth change is required.
