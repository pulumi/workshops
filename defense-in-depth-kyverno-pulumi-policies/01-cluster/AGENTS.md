# AGENTS.md — 01-cluster

Presenter setup, not part of the live demo. `create-cluster.sh` creates the
`kind` cluster (name `policy-demo`, one control-plane node, pinned node
image); `preflight.sh` checks it is reachable and pre-pulls the Kyverno image
so the live `pulumi up` in `02-kyverno` does not stall on a download.

## Rules

- Do these before the session starts. `kind create cluster` and the first
  Kyverno image pull can take minutes on a cold Docker cache.
- The node image is pinned by digest in `kind-config.yaml`'s sibling
  `create-cluster.sh` (`kindest/node:v1.37.0@sha256:...`), matching the kind
  v0.33.0 release. Do not float it to `:latest`.
- `reset.sh` only removes the step-5 demo Pod; it does not touch the cluster
  or Kyverno. Full teardown is the repository root's `teardown.sh`.
