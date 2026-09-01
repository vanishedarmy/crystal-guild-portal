# Hosting Guide — Alpha 5 Web Hotfix 6

Deploy this Web tree with the existing `1.6.0-gold-saucer-a5h5` Bot. Preserve hosted secrets and persistent state. `/api/health` should report runtime `1.6.0-gold-saucer-a5h5`, frontend `1.6.0-gold-saucer-a5h6`, hosted sync **1**, and Portal protocol **29**.

H6 is frontend-only. No Bot restart is required unless your normal deployment process restarts both services. No schema migration is required.
