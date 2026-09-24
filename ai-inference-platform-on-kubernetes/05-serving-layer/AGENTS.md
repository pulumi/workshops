# 05-serving-layer

This folder is deliberately not runnable. It is step 6 of the workshop: a
guided walkthrough of where a model-serving framework (KServe, Ray Serve)
sits on top of everything built in `01-cluster` through `04-autoscaling`,
and an explicit statement of what Pulumi does and does not cover there
today.

## What this folder is for

The brief's core teaching point is that the platform layer (cluster, GPU
drivers, quotas, autoscaling) is a distinct infrastructure-as-code problem
from the serving layer (the model server, its routing, its autoscaling
signal). This workshop teaches the platform layer only. This folder exists
so the presenter has something concrete to point at when explaining where
the platform layer ends.

- `kserve-example.yaml` and `ray-serve-example.yaml` are illustrative
  manifests only. Neither is applied during the demo, and neither is a
  Pulumi resource. Do not add a Pulumi program here.
- There is no first-party Pulumi package for KServe or Ray Serve as of
  2026-09-24 (both `https://www.pulumi.com/registry/packages/kserve/` and
  the equivalent Ray Serve URL return 404). Attendees who want IaC for the
  serving layer today would express these manifests through
  `pulumi_kubernetes` `ConfigFile`/`ConfigGroup` or a raw `CustomResource`,
  the same way `04-autoscaling` expresses Karpenter's `NodePool` and
  `EC2NodeClass` — there is no dedicated SDK the way there is for the
  cluster (`pulumi-eks`) or Karpenter's Helm chart.
- Pulumi's own read on this boundary: the blog post
  https://www.pulumi.com/blog/ai-agents-on-kubernetes/ (read 2026-09-24)
  covers agents running on Kubernetes but does not claim first-party
  serving-framework packages either.

## Verification

Nothing here is meant to run. `kserve-example.yaml` and
`ray-serve-example.yaml` are not applied, not linted against a live
cluster, and not part of any `pulumi preview`. This is intentional, not an
oversight, and the workshop README says so explicitly.
