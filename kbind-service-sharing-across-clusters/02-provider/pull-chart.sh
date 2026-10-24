#!/usr/bin/env bash
# pull-chart.sh — fallback if the Pulumi Helm Release cannot install the OCI chart directly.
#
#   02-provider/pull-chart.sh   # helm pull the chart, point the stack at the local copy
#
# Pulls oci://ghcr.io/kbind-dev/charts/backend at the pinned version into
# 02-provider/.state/chart/backend and sets the chartPath config. Run
# 02-provider/deploy.sh backend afterwards. Not needed when the OCI install works.
# Needs helm.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -euo pipefail

need_org
have helm || die "helm not found. https://helm.sh/docs/intro/install/"
dest="$PROVIDER_DIR/.state/chart"
rm -rf "$dest"
mkdir -p "$dest"
run helm pull "$KBIND_CHART" --version "$KBIND_VERSION" --untar --untardir "$dest"
run pulumi config set chartPath "$dest/backend" --stack "$ORG/$PROVIDER_STACK" --cwd "$PROVIDER_DIR"
note "chartPath is set. Stage 'backend' now installs from the local directory."
