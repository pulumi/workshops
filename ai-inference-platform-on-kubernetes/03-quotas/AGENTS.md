# ai-inference-platform-quotas

Step 4: a namespace with a `ResourceQuota` and `LimitRange` that cap GPU
consumption, so GPU capacity is shared predictably rather than first-come,
first-served.

## Design notes

- The quota is capped at 1 GPU because `01-cluster`'s GPU node group provides
  exactly one `g5.xlarge`. `manifests/oversized-gpu-pod.yaml` requests 2 GPUs
  and is expected to be rejected by the API server, not merely left pending
  by the scheduler, that distinction (admission-time rejection vs.
  scheduling failure) is the point of this step and belongs on its slide.
- `LimitRange` duplicates the cap at the container level as a second layer;
  keep both so the workshop can show the quota error message specifically
  (`exceeded quota: gpu-quota, requested: requests.nvidia.com/gpu=2, used:
  requests.nvidia.com/gpu=0, limited: requests.nvidia.com/gpu=1`).

## Verification

`python3 -m py_compile __main__.py` passes, and `manifests/oversized-gpu-
pod.yaml` parses as a `Pod`. Offline recipe (no AWS account, no cluster):
dummy `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`,
`aws:skipCredentialsValidation`, `aws:skipMetadataApiCheck`,
`aws:skipRequestingAccountId` and `aws:skipRegionValidation` set to `true`, a
local file-backed stack, and a throwaway outputs-only stack named `ai-
inference-platform-cluster` standing in for `01-cluster`. `pulumi preview`
plans 5 resources to create with no errors. Not verified: the API server
rejecting the oversized pod; that needs a live cluster.
