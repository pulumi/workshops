#!/usr/bin/env bash
# teardown.sh — tear the demo down in the reverse of build order: the
# optional PITR restore stack first (it may never have been stood up),
# then the Postgres cluster stack, then the operator/kind-cluster stack
# last. That last destroy also deletes the kind cluster itself via the
# `local.Command` delete hook in 01-cluster-and-operator, so it has to run
# after everything that depends on the cluster still existing.
#
#   07-teardown/teardown.sh
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ctx="kind-pg-workshop-demo"
ns="postgres-demo"

echo "== teardown: postgres-on-kubernetes-cloudnativepg =="
echo "order: 06-pitr-restore (if present) -> 02-postgres-cluster -> 01-cluster-and-operator"
echo

# --- 1. 06-pitr-restore is optional per-demo: a presenter may not have run
# the PITR restore step at all. `pulumi destroy` against a project with no
# deployed stack state fails loudly, so we do not let that abort the rest of
# the teardown; we just report it was skipped.
echo "-- 06-pitr-restore (optional: only stood up if the PITR restore demo ran) --"
if pulumi destroy --yes --cwd "$here/../06-pitr-restore" --stack dev; then
  echo "destroyed 06-pitr-restore/dev"
else
  echo "skipped: 06-pitr-restore/dev had nothing to destroy (restore demo was not run this session)"
fi
echo

# --- 2. 02-postgres-cluster: the Cluster CR, the ObjectStore, the S3 bucket
# and its IAM user. The bucket was created with forceDestroy: true (see the
# bucket resource in 02's index.ts), so this destroy removes it even with
# backup objects still inside — no manual S3 emptying step needed.
echo "-- 02-postgres-cluster --"
pulumi destroy --yes --cwd "$here/../02-postgres-cluster" --stack dev
echo

# --- 3. Verify PVC cleanup before the kind cluster disappears. CloudNativePG's
# docs do not say definitively whether deleting a Cluster CR also deletes its
# backing PersistentVolumeClaims, so we check rather than assume — and we do
# this now, while the kind cluster from 01 still exists to check against.
echo "-- verifying PVC cleanup (CNPG's PVC-retention behavior on Cluster delete is undocumented) --"
leftover_pvcs="$(kubectl get pvc -n "$ns" --context "$ctx" -l cnpg.io/cluster -o name 2>/dev/null || true)"
if [ -n "$leftover_pvcs" ]; then
  echo "found leftover PVC(s) still bound to a deleted Cluster:"
  while IFS= read -r pvc; do echo "  $pvc"; done <<< "$leftover_pvcs"
  echo "deleting them explicitly:"
  kubectl delete pvc -n "$ns" --context "$ctx" -l cnpg.io/cluster
else
  echo "none found: no cnpg.io/cluster-labeled PVCs remain in $ns"
fi
echo

# --- 4. 01-cluster-and-operator last: cert-manager, the barman-cloud plugin,
# the CNPG operator, and the kind cluster itself. The kind cluster is deleted
# by a local.Command "delete" hook attached to the kind cluster resource in
# 01's index.ts, so this single destroy also removes the cluster — no
# separate `kind delete cluster` call is needed here.
echo "-- 01-cluster-and-operator (also deletes the kind cluster via its delete hook) --"
pulumi destroy --yes --cwd "$here/../01-cluster-and-operator" --stack dev
echo

echo "== teardown complete =="
echo "the S3 bucket in 02-postgres-cluster has forceDestroy: true, so the destroy"
echo "above should have removed it even with backups still inside. If you have the"
echo "AWS CLI on hand (not available on this build workstation), you can confirm"
echo "with: aws s3 ls | grep postgres-demo"
