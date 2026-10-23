# Seasonal reward descriptions

Adds a short explanation beneath each Moonlit Emporium reward, including the Nightwatcher title, cosmetic Haunted Candle and the Hollow Crystal Display's Keeper of the Hollow trophy unlock. Descriptions remain visible on collected rewards. Existing or mirrored event payloads use the built-in descriptions; a supplied reward description takes precedence.

The Spooky Supply Cache now grants one sealed inventory cache for 10 Moonlit Tokens. Opening consumes one cache and grants one random item or 100–750 Gil, using the rarity odds shown in the Portal. The earlier statement that the old cache granted no items was incorrect: the purchase handler granted a fixed supply bundle immediately. See `../README_SPOOKY_INVENTORY_CACHE.md` for the current contents and behavior.

For the inventory-cache update, merge both Bot and Web folders and restart both services. Rebuilt frontend output is included; no npm rebuild is required. Existing token balances, claims and trophies are retained.
