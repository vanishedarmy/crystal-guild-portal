# Crystal Guild Alpha 10 — dependency and registry build repair

This patch supplies an npm network diagnostic, one-command dependency installer,
network-retry settings, a standard Dockerfile and an optional prebuilt-assets Dockerfile. It contains **no vendored
`node_modules`** and does not pretend to resolve network blocks on another machine.

## First installation on a machine with internet

Install Node.js 22.12+ and npm, then open a terminal in `Web/frontend`:

```sh
npm run doctor
npm run build:setup
```

`npm run build:setup` chooses `npm install --include=dev` if a lockfile is absent;
a successful first install creates `package-lock.json`. Keep that file and commit
it to your deployment repository for repeatable subsequent `npm ci` installations.
The command then runs `vite build` and verifies `dist/index.html` exists.

**Important:** The older advice to start with `npm ci` does not work against the
unmodified Alpha 10 ZIP: it has no `package-lock.json`. Do not generate a fake
lockfile or disable TLS checks.

## Deploying on Render using Docker

Build the `Web/Dockerfile` from the `Web` build context using its existing
`render.yaml` service configuration. The Dockerfile installs the production and
build dependencies in the Node build stage and copies only the finished static
assets into the Python server stage. If the deployment network reaches npm,
no manual `node_modules` upload is required. Once a real lockfile is included,
Docker will automatically use `npm ci` instead of `npm install`.

## If the DEPLOYMENT environment has no npm access

On an internet-connected desktop or build runner, build this exact Web source
with `npm run build:setup` and preserve `Web/frontend/dist` as a deployment
artifact. Place that directory in the Web build context, then select
`Web/Dockerfile.prebuilt` (instead of `Web/Dockerfile`) in your hosting
configuration. It copies the **already built** assets and performs no npm
network call. The prebuilt alternative cannot create `dist` by itself;
ensure the exact Alpha 10 build is present and don't deploy stale assets.
If using a Git-based build context, `frontend/dist` is ignored by the standard
Git configuration, so add that artifact explicitly or upload a Web archive
containing `dist` for this alternative only.

## Diagnosing npm registry access

```sh
npm config get registry
npm ping --fetch-retries=0 --fetch-timeout=6000
```

On Windows, `nslookup registry.npmjs.org` tests DNS; on macOS/Linux, use
`getent hosts registry.npmjs.org` (or `nslookup`, if installed). If DNS fails,
check the host's DNS settings, VPN, firewall outbound HTTPS/443 rules, and
approved corporate proxy configuration. A transient problem may be helped
by npm retry settings; persistent `EAI_AGAIN`/`ENOTFOUND` **cannot be solved
by changing React/Vite source code**. Have the hosting provider restore
network access or perform the build on a machine with working registry access.
Do not set `strict-ssl=false`, use a random mirror, or disable security checks.

The fixed Vite, React, React DOM, React Router and React plugin versions in
Alpha 10 were preserved: no unreviewed dependency upgrades.

## Tests available without downloading dependencies

```sh
npm run doctor -- --offline
npm run build:setup -- --dry-run
npm run test:unit
```

The first two test the dependency-install path without claiming to have
performed a build. The project's existing frontend test suite contains 55
inherited failures from Alpha 10; run the full suite and assess them separately.
A successful Vite build does not by itself establish that the deployed Bot/Web
and achievement interface pass live integration testing.
