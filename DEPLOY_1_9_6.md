# Crystal Guild Web v1.9.6 — Complete Deployment Root

Use the contents of `Web/` from the complete combined download as the Web service deployment context. Dockerfiles are at this service root. Deploy the matching included Bot.

All source, public assets and rebuilt `frontend/dist` output are included. `Dockerfile.prebuilt` uses this output without npm; `Dockerfile` follows the ordinary source build. Preserve your live configuration, environment variables, secrets and data mounts.

Read the root `START_HERE.md` and this service's `RELEASE_NOTES.md`. Release identity: `1.9.6-triple-triad-expanded`. UI: **v1.9.6 — Triple Triad Expanded**.
