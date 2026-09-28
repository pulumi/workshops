# AGENTS.md — 01-cluster

Pulumi TypeScript project: a kind cluster and the two namespaces the rest
of the workshop targets, in `index.ts`.

## What this provisions

- A `kind` cluster named `storage-caching-workshop-demo` (1 control-plane,
  3 workers), managed with `@pulumi/command`'s `local.Command` since kind
  has no Pulumi provider of its own. 3 workers so Longhorn's default 3-way
  replication has somewhere to put every replica, and so the failover
  drill in `05-failover-drill` has a second worker to reschedule onto.
- The `longhorn-system` namespace (Longhorn's Helm chart lands there in
  `02-longhorn`) and the `caching-workshop` namespace (the workshop's own
  application resources: the writer workload, the Dragonfly cache, the
  cache client Job).

## How to work here

- `npm install` before anything else; `npx tsc --noEmit` must pass cleanly.
- This is the base project: it creates its own cluster, so its
  `k8s.Provider` is built from the `context` string directly
  (`kind-storage-caching-workshop-demo`), never a `pulumi.StackReference`.
  Downstream projects read `kubeconfigContext` and the two namespace names
  from this stack's outputs via `pulumi.StackReference` instead of
  hardcoding them again.
- Set Pulumi config `renderYamlToDirectory` to a directory path to render
  every manifest offline (no kind/docker/kubectl required) for `tsc`/
  `pulumi preview`/`up` verification. Never set it alongside a live run --
  `context` and `renderYamlToDirectory` are treated as mutually exclusive
  on the same provider in this workshop's code, regardless of what the
  current provider docs say about the two coexisting; branching on
  `renderYamlToDirectory`'s presence is the safe pattern either way.
- Re-running `pulumi up` against an existing cluster of the same name fails
  loudly (`kind create cluster` refuses a duplicate name). That is
  intentional: tear down first (see the root README's "Run the demo").
- `kind.yaml` pins every node to `kindest/node:v1.37.0` (kind v0.33.0's own
  release image) so Longhorn's chart `kubeVersion: >=1.25.0-0` gate
  clears; re-pin to a newer digest from
  https://github.com/kubernetes-sigs/kind/releases if kind cuts a new
  release before delivery.
- Longhorn on kind is not a documented, supported combination on either
  longhorn.io or kind.sigs.k8s.io. `kind.yaml`'s `extraMounts` for
  `/var/lib/longhorn` are a workaround for kind's containers-as-nodes
  model, not verified Longhorn guidance. See the root README's "Known
  risk" section and the pull request's open questions before assuming
  this cluster choice is validated for a live Longhorn install.
- The presenter must run Longhorn's `longhornctl install preflight` check
  against this cluster's kubeconfig once, before `02-longhorn`'s
  `pulumi up` (see `02-longhorn/AGENTS.md`); it is a host CLI step, not a
  Pulumi resource in this project.

## Verification

- `npx tsc --noEmit` must pass.
- After `pulumi up` against a live cluster:
  `kubectl --context kind-storage-caching-workshop-demo get nodes` --
  4 nodes, all `Ready`.
