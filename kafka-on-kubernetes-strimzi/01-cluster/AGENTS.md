# AGENTS.md — 01-cluster

Pulumi TypeScript project: a kind cluster and the Strimzi Cluster Operator
(via its OCI Helm chart), in `index.ts`.

## What this provisions

- A `kind` cluster named `kafka-workshop-demo` (1 control-plane, 3 workers),
  managed with `@pulumi/command`'s `local.Command` since kind has no Pulumi
  provider of its own.
- The `kafka` namespace.
- The Strimzi Cluster Operator, chart version 1.2.0, installed from
  `oci://quay.io/strimzi-helm/strimzi-kafka-operator` (the only distribution
  form as of this version — there is no HTTP Helm repo).

## How to work here

- `npm install` before anything else; `npx tsc --noEmit` must pass cleanly.
- This is the base project: it creates its own cluster, so its
  `k8s.Provider` is built from the `context` string directly
  (`kind-kafka-workshop-demo`), never a `pulumi.StackReference`. Downstream
  projects (`02-kafka` onward) read `kubeconfigContext` from this stack's
  outputs via `pulumi.StackReference` instead of hardcoding the name again.
- Set Pulumi config `renderYamlToDirectory` to a directory path to render
  every manifest offline (no kind/docker/kubectl required) for `tsc`/
  `pulumi preview` verification. Never set it alongside a live run --
  `context` and `renderYamlToDirectory` are mutually exclusive on the same
  provider.
- Re-running `pulumi up` against an existing cluster of the same name fails
  loudly (`kind create cluster` refuses a duplicate name). That is
  intentional: run `07-teardown` first.
- `kind.yaml`'s node image is not pinned in this build (see the comment in
  that file for why); pin it during rehearsal before delivery.

## Verification

- `npx tsc --noEmit` must pass.
- After `pulumi up` against a live cluster:
  `kubectl --context kind-kafka-workshop-demo get pods -n kafka` --
  the Strimzi Cluster Operator pod `Running`.
