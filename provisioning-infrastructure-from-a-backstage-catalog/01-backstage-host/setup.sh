#!/usr/bin/env bash
# Scaffolds a fresh Backstage app into ./app and runs the host-build steps
# needed by ./Dockerfile. Run this once, before the workshop, from any
# directory (the script locates itself).
#
# Sources read 2026-09-30:
#   https://backstage.io/docs/getting-started/          (create-app usage --
#     documents only the interactive prompt, not the --path flag or
#     BACKSTAGE_APP_NAME env var used below)
#   https://backstage.io/docs/deployment/docker          (host-build steps)
#   `npx --yes @backstage/create-app@latest --help`     (confirms --path is
#     a real, current flag: "Location to store the app...")
#   node_modules/@backstage/create-app/dist/createApp.cjs.js, read directly
#     from the package that command downloaded (confirms BACKSTAGE_APP_NAME
#     is real and current: when set, it satisfies the inquirer prompt's
#     `when` guard and sets the app name from the env var instead of asking)
# Neither --path nor BACKSTAGE_APP_NAME is documented on the getting-started
# page or in --help; both were verified by reading the actual CLI code
# rather than assumed from memory.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

APP_DIR="$SCRIPT_DIR/app"
APP_NAME="backstage-host"

if [ -d "$APP_DIR" ]; then
  echo "app/ already exists at $APP_DIR -- remove it first if you want a clean scaffold." >&2
  exit 1
fi

if ! command -v yarn >/dev/null 2>&1; then
  echo "yarn is required by @backstage/create-app and was not found on PATH." >&2
  echo "See https://backstage.io/docs/getting-started/#prerequisites" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is required by @backstage/create-app and was not found on PATH." >&2
  echo "See https://backstage.io/docs/getting-started/#prerequisites" >&2
  exit 1
fi

echo "Scaffolding a new Backstage app into $APP_DIR ..."
# BACKSTAGE_APP_NAME skips create-app's interactive name prompt; --path
# templates directly into app/ instead of a directory named after the app.
# See this file's header comment for how both were verified. Neither
# --skip-install nor --legacy is passed: the default behavior already runs
# `yarn install` and `yarn tsc` for us (confirmed in the getting-started
# doc's own transcript of a create-app run).
BACKSTAGE_APP_NAME="$APP_NAME" npx --yes @backstage/create-app@latest --path app

echo "Running the host-build step required by ./Dockerfile (yarn build:backend) ..."
# https://backstage.io/docs/deployment/docker#host-build : the Dockerfile's
# host-build path expects packages/backend/dist/skeleton.tar.gz and
# packages/backend/dist/bundle.tar.gz, which only `yarn build:backend` produces.
(cd "$APP_DIR" && yarn build:backend)

cat <<'EOF'

Scaffold complete. Next steps:
  1. Review app-config.workshop.yaml (catalog locations, guest auth caveat).
  2. docker compose build
  3. docker compose up
  4. Open http://localhost:7007 and confirm the catalog and "Create" page load.

Re-run this script only after deleting app/ -- it refuses to overwrite an
existing scaffold.
EOF
