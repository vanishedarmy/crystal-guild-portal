# Hosting Guide — v1.7.1 Resynthesis Alpha 1

Deploy this Web tree (`1.7.0-final`) with the existing `1.7.0` Bot. Preserve hosted secrets, persistent state, and the live database. Schema remains **15**, hosted sync **1**, and Portal Action protocol **32**.

No Bot redeploy is required if v1.7.1 Resynthesis Alpha 1 is already live. Static artwork now streams from disk rather than accumulating in the hosted Web process cache, and browser revalidation uses ETags.
