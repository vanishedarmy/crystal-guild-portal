# Crystal Guild v1.1.17 — Arsenal II Hotfix 1 Validation Report

## Regression fixed

PASS — `guide-body.html` no longer contains the stale `Cloud Continuity` masthead codename.

PASS — the guide masthead exposes a dedicated `buildTop` target and `guideRuntime.js` fills both the version and build name from the centralized `WEB_RELEASE` label.

PASS — frontend cache identity is `1.1.17-arsenal-ii1h1` in both the React frontend and hosted `/api/health` response.

## Automated checks

- Frontend Node tests: **179 / 179 PASS**
- Hosted Web unit tests: **24 / 24 PASS**
- Python syntax compile for `hosted_portal.py`: **PASS**

## Compatibility

No gameplay, database, protocol, Twitch, OAuth, or Bot behavior is changed by this hotfix.
