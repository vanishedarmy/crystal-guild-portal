# Hosting Guide — Final Hardening & Performance Hotfix 5

Deploy this Web tree (`1.7.0-emporium-annex-a3h5`) with the existing `1.7.0-emporium-annex-a3h3` Bot. Preserve hosted secrets, persistent state, and the live database. Schema remains **15**, hosted sync **1**, and Portal Action protocol **31**.

No Bot redeploy is required if Cloud Storage Hotfix 3 is already live. Static artwork now streams from disk rather than accumulating in the hosted Web process cache, and browser revalidation uses ETags.
