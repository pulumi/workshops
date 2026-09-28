# AGENTS.md — 03-storage-class

Pulumi TypeScript project: the Longhorn-backed StorageClass this workshop
teaches with, in `index.ts`.

## What this provisions

- `StorageClass/longhorn-workshop`, provisioner `driver.longhorn.io`,
  3 replicas, `ext4`, volume expansion allowed. Deliberately not annotated
  as the cluster's default class -- see `02-longhorn`'s chart values, which
  keep Longhorn's own bundled class from claiming that role either.

## How to work here

- `npm install` before anything else; `npx tsc --noEmit` must pass cleanly.
- Reads `kubeconfigContext` from `01-cluster`'s stack and `chartNamespace`
  from `02-longhorn`'s stack via `pulumi.StackReference` (config keys
  `clusterStackRef` and `longhornStackRef`). There is no in-graph Pulumi
  dependency across stacks; run `01`, `02`, then this project in order.
- Same `renderYamlToDirectory`-vs-`context` provider pattern as every
  project in this workshop -- see `01-cluster/AGENTS.md`.

## Verification

- `npx tsc --noEmit` must pass.
- After `pulumi up` against a live cluster:
  `kubectl get storageclass longhorn-workshop` -- present, and
  `kubectl get storageclass` shows no `(default)` marker on it.
