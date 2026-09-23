# Crystal Guild Portal — Hosting Guide (v1.9.0 Alpha 10)

Deploy the matching Alpha 10 Web and Bot packages, runtime `1.9.0-records-moments-alpha10`, local Bot schema **23**, hosted sync **1**, Portal Action protocol **37**. The hosted sync database schema is unchanged; the Bot's local schema 22→23 migration creates a verified backup. Preserve all existing live data and secrets.

The `Dockerfile`, `render.yaml`, `run_hosted_portal.py`, `requirements.txt`, `frontend/vite.config.js` and `.env.example` files are included in this source package. The production Vite build was **not** completed in the development environment because package-registry access was unavailable. Build and run the complete suite on staging with dependency access before production.

For current upgrade instructions, read `UPGRADE_GUIDE.md`. For historical context, see `CHANGELOG.md`.
