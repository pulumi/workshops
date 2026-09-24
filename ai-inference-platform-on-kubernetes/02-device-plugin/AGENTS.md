# ai-inference-platform-device-plugin

Step 3 of the workshop: install the NVIDIA device plugin DaemonSet so the
Kubernetes scheduler sees `nvidia.com/gpu` as an allocatable resource.

## Design notes

- Uses `pulumi_kubernetes.helm.v4.Chart`, the current Helm resource for this
  package (the v4 API docs note the older `Release` resource — `helm.v3` — is
  for production release-management use cases; `v4.Chart` is the
  general-purpose chart installer and what this workshop teaches).
  https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/
  (read 2026-09-24)
- Chart is pinned to `0.20.0`, matching the brief. ArtifactHub listed `0.20.1`
  as current on 2026-09-24 (released two days earlier); `0.20.0` still
  resolves from the chart repository, so the pin was kept and this
  discrepancy is called out in the pull request rather than silently bumped.
- The brief's alternative path (NVIDIA GPU Operator 26.7.0) is not used here;
  the device plugin is the simpler path for a 90-minute workshop and is what
  the brief recommends by default.
- `repository_opts=RepositoryOptsArgs(repo=...)`: the field is `repo`, not
  `url`, on the v4 Chart API.

## Verification

`python3 -m py_compile __main__.py` passes. `pulumi preview` was run against
an empty (never-deployed) `01-cluster` stack: it built the resource graph,
read the (empty) `kubeconfig` output via `StackReference`, and then failed
with `configured Kubernetes cluster is unreachable: unable to load
Kubernetes client configuration from kubeconfig file`. Unlike the plain
Kubernetes resources in `03-quotas`, a Helm chart needs live cluster
connectivity even during preview (for capability/CRD detection), so this
project cannot preview cleanly without a real, deployed `01-cluster` stack
and a reachable cluster. That is the expected and reportable stopping point
for this build machine, which has no AWS credentials and no live cluster.
