#!/usr/bin/env bash
# verify.sh: show that cert-manager issued the certificate and when it expires.
# Usage: ./verify.sh            # uses the kubeconfig of the current kubectl context
set -euo pipefail

kubectl get certificate demo-internal --namespace default

# notAfter of the issued leaf certificate, read from the secret cert-manager wrote.
kubectl get secret demo-internal-tls --namespace default -o jsonpath='{.data.tls\.crt}' \
  | base64 --decode \
  | openssl x509 -noout -subject -issuer -notBefore -notAfter
