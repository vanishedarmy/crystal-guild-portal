# Crystal Guild v1.7.0 — Final Hardening & Performance Hotfix 5

Hotfix 5 is the final v1.7.0 stabilization pass over the verified UI Compactness Hotfix 4 Web baseline. Gameplay and data contracts are frozen.

## Hardening and performance

- Artwork/static binary responses stream in bounded chunks instead of being retained indefinitely in the Web process cache.
- Static responses include ETags so unchanged browser requests can return `304 Not Modified`.
- Gold Saucer, Retainer Service, and the profile detail dialog are loaded only when needed instead of entering the initial profile module path eagerly.
- Image-heavy feature views consistently use browser lazy loading and asynchronous decoding; critical header/lobby imagery remains eager.
- Dynamic cards, badges, controls, and grids receive overflow/min-width safeguards so long labels cannot force horizontal layout breaks.

## UI text consistency

- Visible level labels are normalized to readable spacing such as **Lv. 8** and **JLv. 50** across Portal views, Player Guide copy, and generated Trophy Hall metadata.
- Crafted/Retainer quantity labels use readable multiplication spacing where appropriate (for example **× 1**). Mathematical dimensions such as **3×3** remain compact by design.
- No item values, descriptions intended as gameplay rules, prices, rewards, or progression requirements were altered by the spacing pass.

Web runtime/frontend revision: `1.7.0-emporium-annex-a3h5`. Pair with Bot `1.7.0-emporium-annex-a3h3`. Schema remains **15**, hosted sync **1**, Portal Action protocol **31**, prefix `!`.
