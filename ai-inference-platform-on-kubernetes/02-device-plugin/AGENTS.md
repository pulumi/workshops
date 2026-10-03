# ai-inference-platform-device-plugin

Step 3 of the workshop: install the NVIDIA device plugin DaemonSet so the
Kubernetes scheduler sees `nvidia.com/gpu` as an allocatable resource.

## Design notes

- Uses `pulumi_kubernetes.helm.v4.Chart`, the current Helm resource for this
  package (the v4 API docs note the older `Release` resource, `helm.v3`, is
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

`python3 -m py_compile __main__.py` passes. Offline recipe (no AWS account, no
cluster): dummy `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`,
`aws:skipCredentialsValidation`, `aws:skipMetadataApiCheck`,
`aws:skipRequestingAccountId` and `aws:skipRegionValidation` set to `true`, a
local file-backed stack, and a throwaway outputs-only stack named `ai-
inference-platform-cluster` standing in for `01-cluster`. The `k8s.Provider`
was pointed at `renderYamlToDirectory` in a temporary copy. `pulumi preview`
plans 8 resources to create with no errors. `helm template nvidia-device-
plugin --version 0.20.0` renders a ClusterRole, ClusterRoleBinding,
ServiceAccount and two DaemonSets. Not verified: `nvidia.com/gpu: 1` appearing
as allocatable on a real GPU node.
