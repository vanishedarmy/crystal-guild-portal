# Crystal Guild Web — v1.1.16 Arsenal Hotfix 2

Hosted runtime: `1.1.16-arsenal-h2` · frontend asset revision `1.1.16-arsenal1h2` · hosted sync schema **1** · Portal Action protocol **14**.

This Web-only hotfix is compatible with the unchanged `1.1.16-arsenal-h1` Bot. It repairs Portal queue saturation caused by repeated state polling, makes Daily Provision retries resumable/idempotent, and keeps interactive Solo Ventures refreshing authoritatively while active.

No database migration, Bot restart, new Render secret, player reset, or OAuth scope is required.
