# Performance & UI Hardening Audit — v1.7.0 Hotfix 5

**Result: PASS**

## Hosted static delivery

The previous static-file path could retain requested binary artwork bytes in the process-wide cache. Hotfix 5 keeps caching for small/compressible text assets but streams binary artwork in bounded 128 KiB chunks. This prevents ordinary Portal browsing from growing the process cache toward the size of the artwork library. Static responses now include ETags and honor `If-None-Match` with `304 Not Modified`.

## Frontend loading

Gold Saucer and Retainer Service are lazy profile modules. The detail dialog is also loaded only when opened. Image-heavy views use explicit lazy loading/asynchronous decoding where appropriate, while critical header/lobby imagery remains eager.

## UI resilience

Dynamic grid/card children receive `min-width: 0`, long compact labels may wrap safely, and form controls are max-width bounded. Mobile badge constraints remain in place.

## Text-spacing sweep

Portal/Guide/generated UI uses **Lv. 8** and **JLv. 50** style spacing consistently. User-facing crafted/haul quantities use readable multiplication spacing where appropriate. Compact board/dimension notation such as **3×3** is intentionally unchanged.

No gameplay values, schema, Portal actions, or economy rules changed.
