# Crystal Guild v1.1.16 — Arsenal Hotfix 2 Validation Report

## Certification summary

**PASS — Daily/Portal queue recovery and Solo Venture refresh/retry behavior are certified on the Arsenal Hotfix 1 schema-5 / protocol-14 baseline.**

| Check | Result |
|---|---:|
| Unchanged Bot automated regression tests | **366 / 366 PASS** |
| Frontend source/unit/regression tests | **170 / 170 PASS** |
| Hosted Portal/API tests | **43 / 43 PASS** |
| Python grammar sweep | **74 / 74 PASS** |
| JS/JSX/MJS independent TypeScript parse | **104 / 104 PASS** |

## Queue/recovery contracts

New automated coverage verifies:

- repeated Daily state requests with different browser retry keys resolve to one in-flight hosted action;
- repeated Adventure Board state requests similarly coalesce;
- five simultaneous read-only state requests do not consume the gameplay-mutation queue budget;
- a Solo Venture action is accepted even when several state panels are waiting;
- gameplay actions are claimed ahead of ordinary read-only state refreshes;
- repeated identical Solo round submissions reuse one in-flight action rather than creating two mutations;
- the Adventure Board prevents overlapping state polls;
- an active Solo Venture enables periodic authoritative board refresh;
- Solo start/round/continue/return/retreat requests keep a stable browser key until terminal completion;
- Daily state/claim retries keep a stable browser key and Daily state re-checks delayed completion without spawning a new request.

## Compatibility

- Bot runtime: `1.1.16-arsenal-h1` (unchanged)
- Web runtime: `1.1.16-arsenal-h2`
- Frontend asset revision: `1.1.16-arsenal1h2`
- Local DB schema: **5**
- Hosted sync schema: **1**
- Hosted sync compatibility: `1.1.15-wayfarer`
- Portal Action protocol: **14**
- Twitch prefix: `!`

No database migration, Bot restart, player reset, new Render secret, or Twitch OAuth scope is introduced.

Build-environment note: a full local Vite production bundle is not part of this certification because the frontend dependency tree is not installed in this execution environment. Frontend regressions, independent syntax parsing, hosted API tests, and release-package verification cover the shipped source; Render performs the normal production dependency install/build during deployment.
