# Crystal Guild Web v1.9.7 — Consolidated Complete Build

This is **one complete Web folder**, rebuilt as a distribution from the two original v1.9.7 Web archives and the maintained Web-side updates through Phase 6 plus the artwork-deployment hotfix.

**Release:** 1.9.7-queens-blood (no gameplay changes)

## What is included

- `frontend/dist/`: complete prebuilt hosted Portal, with its HTML, JS, CSS and all 1,077 verified image assets. No npm build required for prebuilt deployment.
- `frontend/public/`: complete matching source/public artwork, including the same 1,077 image assets, so source rebuilds do not lose artwork.
- `frontend/src/`, `frontend/tests/`, frontend tooling, lockfile, source-build config and maintenance fixes.
- Python Web backend, HTTP staging tests, artwork checksum manifest, recovery and validation tools.
- Fixed `Dockerfile.prebuilt.dockerignore`, `Dockerfile.prebuilt`, `Dockerfile` asset gates and Card Hall stylesheet ordering.

**Not included:** Bot, per-machine `frontend/node_modules`, `.env` secrets, hosted databases, runtime-generated state, caches, log files. Preserving existing hosted player-data persistence is mandatory.

## Replace the existing Web installation

1. Back up your current Web installation, hosted persistent database and private environment settings. Do not overwrite any persistent DB volumes or secrets.
2. Stop the Web service. Extract this archive to a staging folder. It contains one **top-level `Web/` directory**.
3. Deploy the *entire* extracted `Web/` directory, not just `index.html` or the JS bundle. For an existing installation, remove the **old** static-only `frontend/dist/` directory before copying this release's `frontend/dist/`; this avoids stale asset chunks. Do not delete live data or persistent mounts.
4. **Recommended prebuilt Docker route:** use build context `Web/` and Dockerfile `Dockerfile.prebuilt` (path relative to that context). It has its own `.dockerignore` rules that include the production artwork. For non-Docker hosting, serve the included complete `frontend/dist/` as the Web static root.
5. **Source Docker route (optional):** use build context `Web/` and `Dockerfile`; it uses npm to rebuild, but `frontend/public/` already contains all the artwork. The Dockerfile verifies artwork before and after building. Source installations can use `cd Web/frontend && npm ci --include=dev && npm run build`.
6. Start Web and use the app's regular health check `/api/health`. Refresh browser caches if the old release was cached. Check `/card-hall/cards/QB001.webp` and the missing images reported previously.

## Checks before deploying

From the parent folder containing `Web/`:

```bash
python Web/tools/artwork_recovery.py check --root Web --target both
```

Expected: **dist 1,077/1,077 and public 1,077/1,077** with 0 missing and 0 incorrect. To test a deployed staging host (read-only HTTP probes):

```bash
python Web/tools/artwork_recovery.py live --root Web --url https://YOUR-STAGING-PORTAL --max-urls 40
```

See `IMAGE_RECOVERY_v1_9_7.md` for detailed deployment and troubleshooting.

Note: Some cross-component frontend regression tests need the matching v1.9.7 `Bot/` as a sibling of `Web/`. Bot is not needed to serve the prebuilt Web folder.

## Validation and limitations

The assembled artifact's images were checksum-validated locally. Existing Phase 6 tests checked local hosted HTTP behavior and Bot-to-Web integration. These results do **not** verify your live image URLs, CDN cache, domain routing or Twitch OAuth. Docker and production browser deployment remain unverified in this environment.

This consolidated build is not a new gameplay release. It is v1.9.7 maintained Web source + complete prebuilt and source artwork. No Bot update or database migration is part of this package.
