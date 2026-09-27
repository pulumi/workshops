# AGENTS.md -- 01-cluster-and-operator

Pulumi TypeScript project `pg-cluster`, stack `dev`. Provisions the kind
cluster this workshop runs on and installs everything the CNPG operator's
current backup path needs before any `Cluster` custom resource can exist:
cert-manager, the CloudNativePG operator, and the Barman Cloud plugin
(CNPG-I).

## What this project provisions

1. A 3-node kind cluster (`pg-workshop-demo`: 1 control-plane, 2 workers) via
   `@pulumi/command`'s `local.Command`, since kind has no Pulumi provider.
2. cert-manager v1.21.2 (Helm, `crds.enabled: true`).
3. The CloudNativePG operator, chart `cloudnative-pg` 0.29.1 (appVersion
   1.30.1), namespace `cnpg-system`.
4. The Barman Cloud plugin (CNPG-I), chart `plugin-barman-cloud` 0.8.0,
   installed into `cnpg-system` -- the operator's own namespace, not its own.

All Helm installs use `k8s.helm.v4.Chart` (never `helm.v3.Release`): it
renders like `helm template --dry-run=server` with no live `Release` object
tracked by Tiller/Helm, which is what makes `renderYamlToDirectory` below
work with no cluster at all.

## Deviation from the original workshop brief

The brief's step 1 was "install the CNPG operator" alone. This folder does
more, because the brief's `spec.backup.barmanObjectStore` field has been
deprecated since operator v1.26: the current, supported backup path is the
out-of-tree Barman Cloud plugin (CNPG-I), and that plugin requires
cert-manager and must share the operator's own namespace
(https://cloudnative-pg.io/plugin-barman-cloud/docs/installation/, read
2026-09-27). Both are load-bearing prerequisites for `02-postgres-cluster`'s
`ObjectStore` custom resource, so they belong here rather than bolted onto a
later step.

## How to work here

- `npm install` before anything else; `npx tsc --noEmit` must pass cleanly.
- This is the base project: it creates its own cluster, so its
  `k8s.Provider` is built from the `context` string directly
  (`kind-pg-workshop-demo`), never a `pulumi.StackReference`. Downstream
  projects (`02-postgres-cluster` onward) read `kubeconfigContext` from this
  stack's outputs via `pulumi.StackReference` instead of hardcoding the name
  again.
- Set Pulumi config `renderYamlToDirectory` to a directory path to render
  every manifest offline (no kind/docker/kubectl required) for `tsc`/
  `pulumi preview` verification. Never set it alongside a live run --
  `context` and `renderYamlToDirectory` are mutually exclusive on the same
  provider.
- Re-running `pulumi up` against an existing cluster of the same name fails
  loudly (`kind create cluster` refuses a duplicate name). That is
  intentional: run `07-teardown` first.

## Verification

- `npx tsc --noEmit` must pass.
- After `pulumi up` against a live cluster:
  - `kubectl --context kind-pg-workshop-demo get pods -n cert-manager` --
    every pod `Running`.
  - `kubectl --context kind-pg-workshop-demo get pods -n cnpg-system` --
    both the CNPG operator pod and the Barman Cloud plugin pod `Running`.
