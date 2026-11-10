#!/usr/bin/env bash
# verify-offline.sh: type-check 01-platform and run `pulumi preview` with no
# cluster and no AWS account. The Kubernetes provider renders YAML to a
# temp directory, the AWS provider skips credential checks, state lives in a
# throwaway local backend, and a throwaway test certificate stands in for the
# one 00-signing-key/generate.sh produces. Your Pulumi login is not touched.
#
#   scripts/verify-offline.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$ROOT/01-platform"
npx tsc --noEmit

# a self-signed stand-in certificate: preview only needs something to embed
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj "/CN=verify" \
  -keyout "$tmp/key.pem" -out "$tmp/cert.crt" >/dev/null 2>&1

export PULUMI_BACKEND_URL="file://$tmp/state"
export PULUMI_CONFIG_PASSPHRASE=throwaway
# a clean Helm config, so repos added on this machine do not affect the render
export HELM_CONFIG_HOME="$tmp/helm/config" HELM_CACHE_HOME="$tmp/helm/cache" HELM_DATA_HOME="$tmp/helm/data"
export HELM_REPOSITORY_CONFIG="$tmp/helm/repositories.yaml" HELM_REPOSITORY_CACHE="$tmp/helm/repository"
export AWS_REGION=us-east-1 AWS_ACCESS_KEY_ID=x AWS_SECRET_ACCESS_KEY=x
mkdir -p "$tmp/state"
pulumi stack init verify >/dev/null
pulumi config set certPath "$tmp/cert.crt" --stack verify
pulumi config set renderYamlToDirectory "$tmp/rendered" --stack verify
pulumi config set aws:skipCredentialsValidation true --stack verify
pulumi config set aws:skipRequestingAccountId true --stack verify
pulumi config set aws:skipMetadataApiCheck true --stack verify
# Known boundary: in render mode the Kubernetes provider checks Helm charts
# against a built-in Kubernetes v1.20.0, and Kyverno's chart needs >=1.25. That
# one error is expected offline and is reported, not hidden; any other error
# fails the script.
rc=0
pulumi preview --stack verify --non-interactive >"$tmp/preview.log" 2>&1 || rc=$?
grep -v -i 'undici\|trace-warnings' "$tmp/preview.log"
if [[ $rc -ne 0 ]]; then
  if grep -q 'chart requires kubeVersion' "$tmp/preview.log" && ! grep 'error:' "$tmp/preview.log" | grep -v 'kubeVersion' | grep -vq 'create 1 error'; then
    echo "NOTE: only the known offline Helm kubeVersion boundary failed (see comment in this script)."
    echo "      The ClusterPolicy depends on the chart, so it is not previewed offline."
    rc=0
  else
    echo "preview failed with an error other than the known boundary" >&2
  fi
fi
pulumi stack rm verify --yes --force >/dev/null
exit "$rc"
