#!/usr/bin/env bash
# port-forward.sh: make Vault reachable on 127.0.0.1:8200 for the Vault provider.
# Usage: ./port-forward.sh        # keep it running in its own terminal
#   then, in another terminal:    pulumi config set vaultConfigure true && pulumi up
set -euo pipefail

kubectl --namespace vault wait --for=condition=Ready pod/vault-0 --timeout=180s
exec kubectl --namespace vault port-forward svc/vault 8200:8200
