# Inventory Identity Cache-Bust Hotfix — Upgrade Guide

Deploy the ii34 Web build normally over ii33. No Bot or database work is required.

The item-art resolver now references new `-v2` Phase 2 asset directories. A fresh browser request will therefore be made for the corrected equipment/material artwork even when old ii32 WebPs remain in a browser or CDN cache.

For patch installs, the obsolete `-v1` Phase 2 folders may remain on disk after copying the patch. They are no longer referenced and can be deleted later if desired. Do not remove `item-icons-v1`; the 32 consumable icons intentionally continue to use that validated path.
