# Crystal Guild Web — v1.1.16 Arsenal Hotfix 5

Hosted runtime: `1.1.16-arsenal-h5` · frontend asset revision `1.1.16-arsenal1h5` · hosted sync schema **1** · Portal Action protocol **14**.

Hotfix 5 fixes large authenticated Bot result acknowledgements being rejected by the old 16 KiB HTTP request reader. Browser/action claims remain at 16 KiB; Bot result envelopes use a separate bounded allowance while actual stored results remain capped at 64 KiB.

Matching Bot runtime remains `1.1.16-arsenal-h4`. No database migration, Bot replacement, new Render secret, player reset, or OAuth scope is required.
