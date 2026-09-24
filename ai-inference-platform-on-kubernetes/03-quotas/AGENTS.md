# ai-inference-platform-quotas

Step 4: a namespace with a `ResourceQuota` and `LimitRange` that cap GPU
consumption, so GPU capacity is shared predictably rather than first-come,
first-served.

## Design notes

- The quota is capped at 1 GPU because `01-cluster`'s GPU node group provides
  exactly one `g5.xlarge`. `manifests/oversized-gpu-pod.yaml` requests 2 GPUs
  and is expected to be rejected by the API server, not merely left pending
  by the scheduler — that distinction (admission-time rejection vs.
  scheduling failure) is the point of this step and belongs on its slide.
- `LimitRange` duplicates the cap at the container level as a second layer;
  keep both so the workshop can show the quota error message specifically
  (`exceeded quota: gpu-quota, requested: requests.nvidia.com/gpu=2, used:
  requests.nvidia.com/gpu=0, limited: requests.nvidia.com/gpu=1`).

## Verification

`python3 -m py_compile __main__.py` passes. `pulumi preview` was run against
an empty (never-deployed) `01-cluster` stack and completed cleanly (`5 to
create`, 0 errors): the plain Kubernetes resources here (`Namespace`,
`ResourceQuota`, `LimitRange`) do not require live cluster connectivity to
preview, unlike the Helm-based projects (`02-device-plugin`,
`04-autoscaling`). This confirms the program is well-formed, not that it
behaves correctly against a real cluster — the rejection itself (`kubectl
apply` failing with the quota error above) is unverified without a live
cluster and a deployed `01-cluster` stack; call this out in the pull request
rather than asserting it.
