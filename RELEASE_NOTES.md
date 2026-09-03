# Crystal Guild v1.7.1 — Resynthesis Alpha 1 Hotfix 1

Hotfix 1 adds an explicit destruction warning to the Blacksmith **Resynthesize Gear** service.

- The Resynthesis tab now displays: **Warning: Resynthesizing permanently destroys the selected gear.**
- The final confirmation dialog now repeats that the selected gear will be permanently destroyed and states that the action cannot be undone.
- Material recovery, eligibility, forge-state handling, prices, inventory behavior, and protected-item rules are unchanged.

Web runtime remains `1.7.1-resynthesis-a1`; frontend asset revision advances to `1.7.1-resynthesis-a1h1`. The paired Bot remains `1.7.1-resynthesis-a1`. Local database schema remains **15**, hosted sync remains **1**, Portal Action protocol remains **32**, and the command prefix remains `!`.
