# AGENTS.md — 03-kubevirt

KubeVirt has no official Helm chart (see the "No Helm chart" note under
https://kubevirt.io/user-guide/cluster_admin/installation/). This project
installs the pinned v1.9.0 release manifests instead: the operator manifest
via `k8s.yaml.v2.ConfigFile`, and the `KubeVirt` custom resource as a typed
`k8s.apiextensions.CustomResource` so `useEmulation` can be set from Pulumi
config rather than templated into a second YAML manifest.

## Rules

- Do not introduce a Helm release for KubeVirt. If a future version ships an
  official chart, that is a decision for the workshop brief, not something to
  swap in here unilaterally.
- Keep the `dependsOn: [operatorConfigFile]` on the `KubeVirt` CustomResource;
  its `kubevirt.io/v1` API only exists once the operator's CRDs are applied.
- `clusterStackRef` in `Pulumi.<stack>.yaml` is a placeholder
  (`<org>/vms-cluster/dev`). Edit it to the real
  `<org>/<project>/<stack>` for 02-cluster before a live run.
- Version pins are load-bearing: KubeVirt v1.9.0 must match `02-cluster` and
  `04-vm`. If you bump it, bump it everywhere (README table, `Pulumi.yaml`
  descriptions, `virtctl` version in `05-console`).

## Verification

- `npx tsc --noEmit` must pass.
- After `pulumi up`, operator readiness:
  `kubectl -n kubevirt get kubevirt kubevirt -o jsonpath='{.status.phase}'`
  must print `Deployed`, and `kubectl -n kubevirt get pods` must show every
  pod `Running`.
