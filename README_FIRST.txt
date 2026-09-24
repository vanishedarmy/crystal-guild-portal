Crystal Guild v1.9.0 Alpha 12 — Camp & Recovery
Runtime: 1.9.0-camp-recovery-alpha12 | local Bot schema 24 | hosted sync 1 | Portal Action protocol 38

The Web source contains the revised Camp & Recovery interface and action relay. The COMPLETE handoff already includes the matching Bot source and entire public folder at Web/frontend/public. You do not need a second archive. Preserve existing hosting secrets, OAuth keys and mounted data when upgrading.

**Fresh frontend build required.** Run npm ci && npm run build inside Web/frontend on the deployment build machine; do not deploy an old dist. Stage-test camp meals, preparations, recovery and the retained mobile combat HUD. Read UPGRADE_GUIDE.md.
