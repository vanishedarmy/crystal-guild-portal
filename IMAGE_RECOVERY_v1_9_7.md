# Crystal Guild v1.9.7 — Image Recovery / Deployment Gate

This patch diagnoses and repairs missing Portal images without changing gameplay, design, player databases, Bot state, or credentials.

## Finding

The original split uploads contain **1,077 image assets in each of two separate locations**:

- `Web 1of2.zip` stores deploy-ready artwork under `Web/frontend/dist/`.
- `Web 2of2.zip` stores the corresponding Vite source artwork under `Web 2of2/frontend/public/` (NOTE: the archive root is literally **Web 2of2**, NOT Web).

For the normal source-build Dockerfile, the `frontend/public` directory must be merged into the *actual* `Web/frontend/public/` before building. Leaving it nested in `Web 2of2/` silently deprives Vite of the assets; URLs in the compiled JavaScript then return 404. For the prebuilt Dockerfile, the original `.dockerignore` excluded `frontend/dist`, even though `Dockerfile.prebuilt` tries to copy it. This patch supplies `Dockerfile.prebuilt.dockerignore` so the prebuilt context includes `dist`.

The verified reconstructed source/`dist` trees each contain all 1,077 image files and pass SHA-256 integrity checks. All **265 directly quoted image URLs** found in the code are present in `dist`, and a local hosted HTTP sample returned **18/18 valid image responses**. This does NOT prove which files are missing on a user's live hosting service: live deployment URL/network logs are required for that.

## Before replacing files

Back up current `Web` source and your host's persistent data mounts/config. Do not change Bot files, user databases, Twitch credentials, or secret environment variables. This patch touches the **Web** build and release tooling only.

## Restore from original archives

Unzip this small patch over your current Web checkout, merging `Web/` into `Web/`. In a terminal with Python 3.12+ at the parent of `Web/`, run:

```bash
python Web/tools/artwork_recovery.py check --root Web --target both
python Web/tools/artwork_recovery.py restore --root Web --target both --web1 "Web 1of2.zip" --web2 "Web 2of2.zip"
python Web/tools/artwork_recovery.py check --root Web --target both
```

The `restore` command reads only allowlisted artwork from the two original archives, verifies SHA-256, and atomically writes missing/incorrect image files in `Web/frontend/dist/` and `Web/frontend/public/`. It does not erase other files. If you only deploy prebuilt assets, `--target dist` and `--web1` are sufficient. If you build from source, `--target public` and `--web2` are sufficient; using `both` leaves either deployment option available. For a preview, add `--dry-run` to `restore`.

A release-consistency gate is now built into both Web Dockerfiles:

- **Source:** `Dockerfile` checks all 1,077 source image assets before Vite build, then checks the output afterward.
- **Prebuilt:** `Dockerfile.prebuilt` checks all 1,077 `dist` images when the image builds; `Dockerfile.prebuilt.dockerignore` makes the files available to the Docker build context.

**Do not deploy only the tiny maintenance ZIP and treat it as a replacement Web build.** It contains tooling and configuration, not the 325 MiB artwork library. The original archives supply that library.

## How to deploy

- For a prebuilt Web container, set the Dockerfile path to `Web/Dockerfile.prebuilt` and Docker build context to the `Web/` directory. Make sure `Web/frontend/dist/` is really present in that context. Dockerfile-specific ignore rules make it available. Do not use a Git-hosted checkout whose `.gitignore` excludes `frontend/dist` unless those assets are explicitly uploaded to the build context.
- For a Vite/source-built container, set the Dockerfile path to `Web/Dockerfile`. Ensure `Web/frontend/public/` exists with the full image tree in the deployment checkout. The Dockerfile now refuses a build if the artwork is missing.
- For a non-Docker deploy, copy the *entire* verified `Web/frontend/dist/` tree (HTML, JS, CSS, and images) to the hosted static root. A partial upload can leave the UI working but artwork broken. Avoid mixing asset chunks from separate builds.

Restart/redeploy **only the Web service** once the static tree and Docker context are correct. On the hosted portal, inspect the browser Network panel for image 404/403 responses; a 404 at `/retro-phase-iii/...` or `/card-hall/...` means the deployed static root is still missing those assets. For a read-only live sampling check:

```bash
python Web/tools/artwork_recovery.py live --root Web --url "https://YOUR-STAGING-PORTAL" --max-urls 40
```

This tool checks HTTP status, image MIME type, byte length and SHA-256 for representative images across art directories. Do not point it at a live service without permission. It cannot by itself test authenticated, lazy-loaded browser screens.

## Verification scope

- 1,077/1,077 images in local `public/`, 1,077/1,077 in `dist/` (verified by digest against the original archives in reconstruction).
- 265/265 directly quoted image paths located in prebuilt `dist`.
- 18/18 local hosted HTTP image requests returned correct MIME, size, and image bytes.
- Five new offline recovery/deployment tests pass.
- No full live-host or authenticated browser verification was performed; local tests cannot confirm the cause of live 404s, CSP issues, reverse-proxy routing, or cached old assets.
