# Crystal Guild Web — v1.1.16 Arsenal Hotfix 3

Hosted runtime: `1.1.16-arsenal-h3` · frontend asset revision `1.1.16-arsenal1h3` · hosted sync schema **1** · Portal Action protocol **14**.

This Web-only hotfix is compatible with the unchanged `1.1.16-arsenal-h1` Bot. It fixes expanded Adventure Board results that could exceed the former 16 KiB relay-result ceiling and leave a persisted Solo Venture hidden from the browser. Browser-submitted action payloads remain capped at 16 KiB; authoritative Bot results use a separately bounded 64 KiB ceiling.

The Adventure Board also retries initial state recovery and shows a truthful Checking state until authoritative Solo Venture data arrives.

No database migration, Bot restart, new Render secret, player reset, or OAuth scope is required.
