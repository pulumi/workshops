# AGENTS.md — 04-stateful-app

Pulumi TypeScript project: the workshop's stateful demo workload, in
`index.ts`.

## What this provisions

- `PersistentVolumeClaim/workshop-data`: 1Gi on the `longhorn-workshop`
  StorageClass from `03-storage-class`. Deliberately small -- the brief's
  risk section calls for a dataset sized for a fast rebuild during the
  live failover drill, not a realistic production size.
- `Deployment/record-writer`: one replica, `busybox:1.36`, appends a
  timestamped line to `/data/records.log` on the PVC every 5 seconds. A
  Deployment rather than a bare Pod so `05-failover-drill` cordoning and
  draining its node causes the controller to reschedule it onto another
  worker automatically -- that reschedule, and the record surviving it, is
  the whole point of the drill.

## How to work here

- `npm install` before anything else; `npx tsc --noEmit` must pass cleanly.
- Reads `kubeconfigContext` and `workshopNamespaceName` from `01-cluster`'s
  stack, and `storageClassName` from `03-storage-class`'s stack, via
  `pulumi.StackReference` (config keys `clusterStackRef` and
  `storageClassStackRef`). Run `01`, `02`, `03`, then this project in order.
- Same `renderYamlToDirectory`-vs-`context` provider pattern as every
  project in this workshop -- see `01-cluster/AGENTS.md`.

## Verification

- `npx tsc --noEmit` must pass.
- After `pulumi up` against a live cluster:
  `kubectl -n caching-workshop get pvc workshop-data` -- `Bound`;
  `kubectl -n caching-workshop get pods -l app=record-writer` -- `Running`;
  `kubectl -n caching-workshop exec deploy/record-writer -- cat /data/records.log`
  -- shows appended timestamp lines.
