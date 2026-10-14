#!/usr/bin/env bash
# install-deps.sh: npm ci in every Pulumi project of this workshop.
#
#   scripts/install-deps.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
for dir in 01-cluster 02-longhorn 03-storageclass 04-stateful-app 06-dragonfly; do
  (cd "$ROOT/$dir" && npm ci)
done
