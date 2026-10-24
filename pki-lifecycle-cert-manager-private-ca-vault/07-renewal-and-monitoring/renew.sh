#!/usr/bin/env bash
# renew.sh: force cert-manager to renew the demo certificate now.
# Usage: ./renew.sh [certificate-name]    # default: demo-internal
set -euo pipefail

name="${1:-demo-internal}"
before="$(kubectl get secret "${name}-tls" --namespace default -o jsonpath='{.data.tls\.crt}' | base64 --decode | openssl x509 -noout -serial)"
echo "before: ${before}"

# cmctl is the documented way to mark a Certificate for manual renewal.
if command -v cmctl >/dev/null 2>&1; then
  cmctl renew "${name}" --namespace default
else
  # Fallback without cmctl: deleting the secret makes cert-manager reissue the certificate.
  echo "cmctl not found, deleting the secret to trigger reissue"
  kubectl delete secret "${name}-tls" --namespace default
fi

kubectl wait --for=condition=Ready "certificate/${name}" --namespace default --timeout=120s
sleep 5
after="$(kubectl get secret "${name}-tls" --namespace default -o jsonpath='{.data.tls\.crt}' | base64 --decode | openssl x509 -noout -serial)"
echo "after:  ${after}"
