#!/usr/bin/env bash
# verify-offline.sh: type-check one Pulumi project and run `pulumi preview` in
# render mode, with no cluster. State lives in a throwaway local backend, so
# your Pulumi login is not touched.
#
#   scripts/verify-offline.sh 03-storageclass
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
project="${1:?usage: verify-offline.sh <project-folder>}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$ROOT/$project"
npx tsc --noEmit

export PULUMI_BACKEND_URL="file://$tmp/state"
export PULUMI_CONFIG_PASSPHRASE=throwaway
mkdir -p "$tmp/state"
pulumi stack init verify >/dev/null
pulumi config set renderYamlToDirectory "$tmp/rendered" --stack verify
pulumi preview --stack verify --non-interactive
pulumi stack rm verify --yes --force >/dev/null
